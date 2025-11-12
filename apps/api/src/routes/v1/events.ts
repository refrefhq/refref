import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
const { participant, referral, referralLink } = schema;
import { eq, and } from "drizzle-orm";
import { type EventMetadataV1Type } from "@refref/types";
import { createEvent } from "../../services/events.js";

// Top-level "envelope"
const BaseEvent = z.object({
  eventType: z.string(), // discriminant
  timestamp: z.string().datetime(), // ISO 8601
  productId: z.string(), // Product ID is required
  programId: z.string().optional(), // Program ID is optional
});

// 1) Signup event
const signupEvent = BaseEvent.extend({
  eventType: z.literal("signup"),
  payload: z.object({
    userId: z.string(), // External user ID
    referralCode: z.string().optional(), // Referral code if user was referred
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
});

// 2) Purchase event
const purchaseEvent = BaseEvent.extend({
  eventType: z.literal("purchase"),
  payload: z.object({
    userId: z.string(), // External user ID
    orderAmount: z.number().positive(),
    orderId: z.string(),
    productIds: z.array(z.string()).optional(),
    currency: z.string().default("USD"),
  }),
});

// Discriminated union for all possible event types
const EventSchema = z.discriminatedUnion("eventType", [
  signupEvent,
  purchaseEvent,
]);

export default async function eventsRoutes(fastify: FastifyInstance) {
  /**
   * POST /v1/events
   * Create a new event with API key authentication
   */
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticateApiKey],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parsedEvent = EventSchema.safeParse(request.body);

        if (!parsedEvent.success) {
          return reply.code(400).send({
            success: false,
            message: "Invalid event data",
            errors: parsedEvent.error.format(),
          });
        }

        const eventData = parsedEvent.data;
        request.log.info({ eventData }, "Received and validated event via POST");

        // Use a transaction for the entire event processing
        const result = await request.db.transaction(async (tx) => {
          // Find or create participant
          let participantId: string | undefined;
          let referralId: string | undefined;

          if (eventData.eventType === "signup") {
            // Check if participant already exists
            const [existingParticipant] = await tx
              .select()
              .from(participant)
              .where(
                and(
                  eq(participant.productId, eventData.productId),
                  eq(participant.externalId, eventData.payload.userId)
                )
              )
              .limit(1);

            if (existingParticipant) {
              participantId = existingParticipant.id;
            } else {
              // Create new participant within the transaction
              const [newParticipant] = await tx
                .insert(participant)
                .values({
                  productId: eventData.productId,
                  externalId: eventData.payload.userId,
                  email: eventData.payload.email,
                  name: eventData.payload.name,
                })
                .returning();

              participantId = newParticipant?.id;
            }

            // If referral code provided, find referrer and create referral
            if (eventData.payload.referralCode && participantId) {
              const [referrerLink] = await tx
                .select()
                .from(referralLink)
                .where(eq(referralLink.slug, eventData.payload.referralCode))
                .limit(1);

              if (referrerLink) {
                const [newReferral] = await tx
                  .insert(referral)
                  .values({
                    referrerId: referrerLink.participantId,
                    externalId: eventData.payload.userId,
                    email: eventData.payload.email,
                    name: eventData.payload.name,
                  })
                  .onConflictDoNothing()
                  .returning();

                if (newReferral) {
                  referralId = newReferral.id;
                }
              }
            }
          } else if (eventData.eventType === "purchase") {
            // Find participant by external ID
            const [existingParticipant] = await tx
              .select()
              .from(participant)
              .where(
                and(
                  eq(participant.productId, eventData.productId),
                  eq(participant.externalId, eventData.payload.userId)
                )
              )
              .limit(1);

            if (existingParticipant) {
              participantId = existingParticipant.id;

              // Check if this participant was referred
              const [referralRecord] = await tx
                .select()
                .from(referral)
                .where(eq(referral.externalId, eventData.payload.userId))
                .limit(1);

              if (referralRecord) {
                referralId = referralRecord.id;
              }
            }
          }

          // Create event metadata
          const metadata: EventMetadataV1Type = {
            schemaVersion: 1,
            source: "api",
          };

          if (eventData.eventType === "purchase") {
            metadata.orderAmount = eventData.payload.orderAmount;
            metadata.orderId = eventData.payload.orderId;
            metadata.productIds = eventData.payload.productIds;
          }

          // Return the data needed to create the event
          return { participantId, referralId, metadata };
        });

        // Create the event using our events service (outside transaction)
        const newEvent = await createEvent(request.db, {
          productId: eventData.productId,
          programId: eventData.programId,
          eventType: eventData.eventType,
          participantId: result.participantId,
          referralId: result.referralId,
          metadata: result.metadata,
        });

        return reply.send({
          success: true,
          message: "Event processed successfully.",
          eventId: newEvent.id,
        });
      } catch (error) {
        request.log.error({ error }, "Error processing event");

        let errorMessage = "Internal Server Error";
        let statusCode = 500;

        // Check if the error is due to JSON parsing issues (e.g., empty or malformed body)
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          errorMessage = "Invalid JSON payload provided.";
          statusCode = 400;
        } else if (error instanceof z.ZodError) {
          // It seems ZodErrors are not caught here, but adding for completeness
          errorMessage = "Invalid request body.";
          statusCode = 400;
        }

        return reply.code(statusCode).send({
          success: false,
          message: errorMessage
        });
      }
    }
  );
}
