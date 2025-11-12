import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
const { participant, referralLink, referral } = schema;
import { createId } from "@refref/id";
import { createId as createUnprefixedId } from "@paralleldrive/cuid2";
import {
  widgetInitRequestSchema,
  type WidgetInitResponseType,
} from "@refref/types";
import { createEvent } from "../../../services/events.js";

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
        const { productId, referralCode } = body;

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

        // Auto-attribution: Create referral if RFC provided and participant is new
        let referralRecordId: string | null = null;
        if (referralCode && !existingParticipant) {
          try {
            // Find the referral link by slug
            const referrerLink = await request.db.query.referralLink.findFirst({
              where: (referralLink, { eq }) => eq(referralLink.slug, referralCode),
            });

            if (referrerLink) {
              // Create referral record linking the new participant (referee) to the referrer
              const referralId = createId("referral");
              const [newReferral] = await request.db
                .insert(referral)
                .values({
                  id: referralId,
                  referrerId: referrerLink.participantId,
                  externalId: request.user.sub,
                  email: request.user.email,
                  name: request.user.name,
                })
                .onConflictDoNothing() // Prevent duplicate referrals
                .returning();

              if (newReferral) {
                referralRecordId = newReferral.id;
                request.log.info({
                  referralCode,
                  referrerId: referrerLink.participantId,
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
              request.log.warn({ referralCode }, "Referral code not found");
            }
          } catch (error) {
            // Log but don't fail widget init on attribution errors
            request.log.error({ error }, "Auto-attribution failed");
          }
        }

        // Get or create referral link
        let referralLinkRecord = await request.db.query.referralLink.findFirst({
          where: (referralLink, { eq }) => eq(referralLink.participantId, participantRecord.id),
        });

        if (!referralLinkRecord) {
          let retries = 3;
          while (retries > 0 && !referralLinkRecord) {
            const slug = createUnprefixedId().slice(0, 8);
            const [newLink] = await request.db
              .insert(referralLink)
              .values({
                id: createId("referralLink"),
                participantId: participantRecord.id,
                slug: slug,
              })
              .onConflictDoNothing()
              .returning();
            referralLinkRecord = newLink;
            if (!referralLinkRecord) {
              retries--;
              request.log.warn({ participantId: participantRecord.id, slug }, "Referral link slug collision, retrying...");
            }
          }
        }

        if (!referralLinkRecord) {
          return reply.code(500).send({
            error: "Internal Server Error",
            message: "Failed to create or find referral link"
          });
        }

        // Get program widget config
        const programData = await request.db.query.program.findFirst({
          where: (program, { eq }) => eq(program.id, activeProgram.id),
        });

        const widgetData = programData?.config?.widgetConfig;

        // Get APP_URL from environment
        const appUrl = process.env.APP_URL || "http://localhost:3000";

        if (!widgetData) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Widget configuration not found for this program."
          });
        }

        // Return the widget configuration
        const response: WidgetInitResponseType = {
          ...widgetData,
          referralLink: `${appUrl}/r/${referralLinkRecord.slug}`,
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
