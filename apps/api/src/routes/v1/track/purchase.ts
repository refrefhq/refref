import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
const { participant, referral } = schema;
import { eq, and } from "drizzle-orm";
import { type EventMetadataV1Type } from "@refref/types";
import { createEvent } from "../../../services/events.js";

// Purchase event request schema (no eventType discriminator needed)
const purchaseRequestSchema = z.object({
  timestamp: z.string().datetime(),
  productId: z.string(),
  programId: z.string().optional(),
  payload: z.object({
    userId: z.string(),
    orderAmount: z.number().positive(),
    orderId: z.string(),
    productIds: z.array(z.string()).optional(),
    currency: z.string().default("USD"),
  }),
});

export default async function purchaseTrackRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticateApiKey],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = purchaseRequestSchema.parse(request.body);

        // Use a transaction for the entire purchase tracking
        const result = await request.db.transaction(async (tx) => {
          let participantId: string | undefined;
          let referralId: string | undefined;

          // Find participant by external ID
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

            // Check if this participant was referred
            const [referralRecord] = await tx
              .select()
              .from(referral)
              .where(eq(referral.externalId, body.payload.userId))
              .limit(1);

            if (referralRecord) {
              referralId = referralRecord.id;
            }
          }

          // Create event metadata with purchase details
          const metadata: EventMetadataV1Type = {
            schemaVersion: 1,
            source: "api",
            orderAmount: body.payload.orderAmount,
            orderId: body.payload.orderId,
            productIds: body.payload.productIds,
          };

          // Return the data needed to create the event
          return { participantId, referralId, metadata };
        });

        // Create the event using our service (outside transaction)
        const newEvent = await createEvent(request.db, {
          productId: body.productId,
          programId: body.programId,
          eventType: "purchase", // Hardcoded for this endpoint
          participantId: result.participantId,
          referralId: result.referralId,
          metadata: result.metadata,
        });

        return reply.send({
          success: true,
          message: "Purchase tracked successfully.",
          eventId: newEvent.id,
        });
      } catch (error) {
        request.log.error({ error }, "Error tracking purchase");

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
