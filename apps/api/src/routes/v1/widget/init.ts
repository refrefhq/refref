import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
const { participant, refcode, referral } = schema;
import { createId } from "@refref/id";
import {
  widgetInitRequestSchema,
  type WidgetInitResponseType,
} from "@refref/types";
import { createEvent } from "../../../services/events.js";
import { generateGlobalCode, normalizeCode } from "@refref/utils";

export default async function widgetInitRoutes(fastify: FastifyInstance) {
  /**
   * POST /v1/widget/init
   * Initialize widget session with JWT authentication
   */
  fastify.post(
    "/init",
    {
      preHandler: [fastify.authenticateJWT],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Parse and validate request body
        const body = widgetInitRequestSchema.parse(request.body);
        const { productId, refcode: refcodeParam } = body;

        // Verify user is authenticated
        if (!request.user) {
          return reply.code(401).send({
            error: "Unauthorized",
            message: "Authentication required"
          });
        }

        // Verify productId matches JWT
        if (request.user.productId !== productId) {
          return reply.code(403).send({
            error: "Forbidden",
            message: "Product ID mismatch"
          });
        }

        // Ensure there is an active program for this product
        const activeProgram = await request.db.query.program.findFirst({
          where: (program, { eq, and }) =>
            and(
              eq(program.productId, productId),
              eq(program.status, "active")
            ),
          orderBy: (program, { asc }) => [asc(program.createdAt)],
        });

        if (!activeProgram) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "No active program found for this product"
          });
        }

        // Check if participant already exists
        const existingParticipant = await request.db.query.participant.findFirst({
          where: (participant, { eq, and }) =>
            and(
              eq(participant.productId, productId),
              eq(participant.externalId, request.user!.sub)
            ),
        });

        // Upsert participant
        const [participantRecord] = await request.db
          .insert(participant)
          .values({
            externalId: request.user.sub,
            productId,
            email: request.user.email,
            name: request.user.name,
          })
          .onConflictDoUpdate({
            target: [participant.productId, participant.externalId],
            set: {
              email: request.user.email,
              name: request.user.name,
            },
          })
          .returning();

        if (!participantRecord) {
          return reply.code(500).send({
            error: "Internal Server Error",
            message: "Failed to create or find participant"
          });
        }

        // Auto-attribution: Create referral if refcode provided and participant is new
        let referralRecordId: string | null = null;
        if (refcodeParam && !existingParticipant) {
          try {
            const normalizedRefcode = normalizeCode(refcodeParam);

            // Find the refcode within this product only (enforce product boundary)
            // Note: global flag only means the code uses 7-char format, not that it works across products
            const referrerCode = await request.db.query.refcode.findFirst({
              where: (refcode, { eq, and }) =>
                and(
                  eq(refcode.code, normalizedRefcode),
                  eq(refcode.productId, productId)
                ),
            });

            if (referrerCode) {
              // Create referral record linking the new participant (referee) to the referrer
              const referralId = createId("referral");
              const [newReferral] = await request.db
                .insert(referral)
                .values({
                  id: referralId,
                  referrerId: referrerCode.participantId,
                  externalId: request.user.sub,
                  email: request.user.email,
                  name: request.user.name,
                })
                .onConflictDoNothing() // Prevent duplicate referrals
                .returning();

              if (newReferral) {
                referralRecordId = newReferral.id;
                request.log.info({
                  refcode: normalizedRefcode,
                  referrerId: referrerCode.participantId,
                  refereeId: request.user.sub,
                  referralId: referralRecordId,
                }, "Auto-attribution successful");

                // Create signup event for reward processing
                try {
                  await createEvent(request.db, {
                    productId,
                    programId: activeProgram.id,
                    eventType: "signup",
                    participantId: participantRecord.id,
                    referralId: referralRecordId,
                    metadata: {
                      schemaVersion: 1,
                      source: "auto",
                      reason: "Widget initialization with referral code",
                    },
                  });
                  request.log.info("Created signup event for referral attribution");
                } catch (eventError) {
                  request.log.error({ error: eventError }, "Failed to create signup event");
                  // Don't fail widget init if event creation fails
                }
              }
            } else {
              request.log.warn({ refcode: normalizedRefcode }, "Referral code not found");
            }
          } catch (error) {
            // Log but don't fail widget init on attribution errors
            request.log.error({ error }, "Auto-attribution failed");
          }
        }

        // Get or create refcode (global code by default)
        // If multiple refcodes exist, get the most recent one
        let refcodeRecord = await request.db.query.refcode.findFirst({
          where: (refcode, { eq, and }) =>
            and(
              eq(refcode.participantId, participantRecord.id),
              eq(refcode.programId, activeProgram.id)
            ),
          orderBy: (refcode, { desc }) => [desc(refcode.createdAt)],
        });

        if (!refcodeRecord) {
          // Generate global code with profanity filtering (up to 5 attempts)
          let currentCode = generateGlobalCode(5);

          if (!currentCode) {
            return reply.code(500).send({
              error: "Internal Server Error",
              message: "Failed to generate unique refcode after multiple attempts"
            });
          }

          // Try to insert the refcode
          let insertRetries = 3;
          while (insertRetries > 0 && !refcodeRecord) {
            try {
              const [newRefcode] = await request.db
                .insert(refcode)
                .values({
                  id: createId("refcode"),
                  code: currentCode,
                  participantId: participantRecord.id,
                  programId: activeProgram.id,
                  productId: productId,
                  global: true,
                })
                .onConflictDoNothing()
                .returning();

              refcodeRecord = newRefcode;

              if (!refcodeRecord) {
                insertRetries--;
                request.log.warn({
                  participantId: participantRecord.id,
                  code: currentCode
                }, "Refcode collision on insert, retrying with new code...");

                // Generate a new code for next retry
                const newCode = generateGlobalCode(5);
                if (!newCode) {
                  break;
                }
                // Actually use the new code in the next iteration
                currentCode = newCode;
              }
            } catch (error) {
              insertRetries--;
              request.log.error({ error }, "Error inserting refcode");
              if (insertRetries === 0) {
                throw error;
              }
            }
          }
        }

        if (!refcodeRecord) {
          return reply.code(500).send({
            error: "Internal Server Error",
            message: "Failed to create or find refcode"
          });
        }

        // Get program widget config
        const programData = await request.db.query.program.findFirst({
          where: (program, { eq }) => eq(program.id, activeProgram.id),
        });

        const widgetData = programData?.config?.widgetConfig;

        // Get REFERRAL_HOST_URL from environment
        const referralHostUrl = process.env.REFERRAL_HOST_URL || "http://localhost:3002";

        if (!widgetData) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Widget configuration not found for this program."
          });
        }

        // Build referral URL based on code type
        let referralUrl: string;
        if (refcodeRecord.global) {
          // Global code: /r/:code
          referralUrl = `${referralHostUrl}/r/${refcodeRecord.code}`;
        } else {
          // Local code: /r/:productSlug/:code (need product slug)
          const productData = await request.db.query.product.findFirst({
            where: (product, { eq }) => eq(product.id, productId),
          });

          if (!productData?.slug) {
            return reply.code(500).send({
              error: "Internal Server Error",
              message: "Product slug not configured for local refcode"
            });
          }

          referralUrl = `${referralHostUrl}/r/${productData.slug}/${refcodeRecord.code}`;
        }

        // Return the widget configuration
        const response: WidgetInitResponseType = {
          ...widgetData,
          referralLink: referralUrl,
        };

        return reply.send(response);
      } catch (error) {
        request.log.error({ error }, "Error in widget init");

        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Invalid request body",
            details: error.issues
          });
        }

        return reply.code(500).send({
          error: "Internal Server Error",
          message: "An unexpected error occurred"
        });
      }
    }
  );
}
