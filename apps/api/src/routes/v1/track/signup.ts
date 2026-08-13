import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
const { participant, referral, refcode, rewardRule } = schema;
import { eq, and } from "drizzle-orm";
import {
  type EventMetadataV1Type,
  type RewardRuleConfigV1Type,
  type ReferralQualifiedPayload,
} from "@refref/types";
import { createEvent } from "../../../services/events.js";
import { normalizeCode } from "@refref/utils";
import { enqueueWebhook } from "@refref/webhooks";
import { reconcileSignup } from "../../../services/referral-lead.js";

/**
 * Derive the referrer reward summary for the qualified webhook. Reward release
 * is gated on manual approval in v1, so status is always reported as
 * "pending_approval" regardless of the rule's disbursal type.
 */
async function deriveRewardSummary(
  db: FastifyRequest["db"],
  programId: string,
): Promise<ReferralQualifiedPayload["reward"]> {
  const rules = await db
    .select()
    .from(rewardRule)
    .where(
      and(eq(rewardRule.programId, programId), eq(rewardRule.isActive, true)),
    );
  const referrerRule = rules.find(
    (r) => (r.config as RewardRuleConfigV1Type)?.participantType === "referrer",
  );
  if (!referrerRule) return null;
  const c = referrerRule.config as RewardRuleConfigV1Type;
  return {
    id: null,
    type: c.reward.type,
    amount: Number(c.reward.amount) || 0,
    currency: c.reward.currency || "AUD",
    status: "pending_approval",
  };
}

// Signup event request schema (no eventType discriminator needed)
const signupRequestSchema = z.object({
  timestamp: z.string().datetime(),
  productId: z.string(),
  programId: z.string().optional(),
  payload: z.object({
    userId: z.string(),
    refcode: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    // Optional deterministic hand-off matching (from the referee form flow).
    handoffToken: z.string().optional(),
    leadId: z.string().optional(),
  }),
});

export default async function signupTrackRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticateApiKey],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = signupRequestSchema.parse(request.body);

        // Use a transaction for the entire signup tracking
        const result = await request.db.transaction(async (tx) => {
          let participantId: string | undefined;
          let referralId: string | undefined;

          // Check if participant already exists
          const [existingParticipant] = await tx
            .select()
            .from(participant)
            .where(
              and(
                eq(participant.productId, body.productId),
                eq(participant.externalId, body.payload.userId),
              ),
            )
            .limit(1);

          if (existingParticipant) {
            participantId = existingParticipant.id;
          } else {
            // Create new participant within the transaction
            const [newParticipant] = await tx
              .insert(participant)
              .values({
                productId: body.productId,
                externalId: body.payload.userId,
                email: body.payload.email,
                name: body.payload.name,
              })
              .returning();

            participantId = newParticipant?.id;
          }

          // If refcode provided, find referrer and create referral
          if (body.payload.refcode && participantId) {
            const normalizedRefcode = normalizeCode(body.payload.refcode);

            // Look up refcode (could be global or local)
            // For signup tracking, we don't know the product slug, so we match by code and productId
            const [referrerCode] = await tx
              .select()
              .from(refcode)
              .where(
                and(
                  eq(refcode.code, normalizedRefcode),
                  eq(refcode.productId, body.productId),
                ),
              )
              .limit(1);

            if (referrerCode) {
              const [newReferral] = await tx
                .insert(referral)
                .values({
                  referrerId: referrerCode.participantId,
                  externalId: body.payload.userId,
                  email: body.payload.email,
                  name: body.payload.name,
                })
                .onConflictDoNothing()
                .returning();

              if (newReferral) {
                referralId = newReferral.id;
              }
            }
          }

          // Create event metadata
          const metadata: EventMetadataV1Type = {
            schemaVersion: 1,
            source: "api",
          };

          // Return the data needed to create the event
          return { participantId, referralId, metadata };
        });

        // Create the event using our service (outside transaction)
        const newEvent = await createEvent(request.db, {
          productId: body.productId,
          programId: body.programId,
          eventType: "signup", // Hardcoded for this endpoint
          participantId: result.participantId,
          referralId: result.referralId,
          metadata: result.metadata,
        });

        // Reconcile any pending referee lead into "qualified" and emit the
        // referral.qualified webhook. Best-effort: a hiccup here must never fail
        // the signup tracking itself (the event is already recorded).
        try {
          const qualified = await reconcileSignup(request.db, {
            productId: body.productId,
            email: body.payload.email,
            leadId: body.payload.leadId,
            handoffToken: body.payload.handoffToken,
            referralId: result.referralId,
            refereeExternalId: body.payload.userId,
            windowDays: Number(process.env.ATTRIBUTION_WINDOW_DAYS) || 30,
          });

          if (qualified) {
            const reward = await deriveRewardSummary(
              request.db,
              qualified.programId,
            );
            const qualifiedPayload: Omit<
              ReferralQualifiedPayload,
              "event_id"
            > = {
              event: "referral.qualified",
              occurred_at: new Date().toISOString(),
              program_id: qualified.programId,
              referral: {
                id: result.referralId ?? qualified.leadId,
                code: qualified.code,
                status: "qualified",
              },
              referee: {
                email: qualified.email,
                external_id: body.payload.userId,
              },
              reward,
              matched_by: qualified.matchedBy,
            };

            await enqueueWebhook(request.db, {
              productId: body.productId,
              eventType: "referral.qualified",
              payload: qualifiedPayload as unknown as Record<string, unknown>,
              dedupeKey: `qualified:${qualified.leadId}`,
            });
          }
        } catch (err) {
          request.log.error(
            { err },
            "referral qualification reconcile failed",
          );
        }

        return reply.send({
          success: true,
          message: "Signup tracked successfully.",
          eventId: newEvent.id,
        });
      } catch (error) {
        request.log.error({ error }, "Error tracking signup");

        let errorMessage = "Internal Server Error";
        let statusCode = 500;

        // Check if the error is due to JSON parsing issues (e.g., empty or malformed body)
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          errorMessage = "Invalid JSON payload provided.";
          statusCode = 400;
        } else if (error instanceof z.ZodError) {
          errorMessage = "Invalid request body.";
          statusCode = 400;
        }

        return reply.code(statusCode).send({
          success: false,
          message: errorMessage,
        });
      }
    },
  );
}
