import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/trpc/server";
import { db, schema } from "@/server/db";
const { participant, referral, product } = schema;
import { eq, and } from "drizzle-orm";
import { eventMetadataV1Schema, type EventMetadataV1Type } from "@refref/types";

// Top‐level "envelope"
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

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    const parsedEvent = EventSchema.safeParse(requestBody);

    if (!parsedEvent.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event data",
          errors: parsedEvent.error.format(),
        },
        { status: 400 },
      );
    }
    const eventData = parsedEvent.data;

    console.log("Received and validated event via POST:", eventData);

    // Use a transaction for the entire event processing
    const result = await db.transaction(async (tx) => {
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
              eq(participant.externalId, eventData.payload.userId),
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
              productId: eventData.productId,
              externalId: eventData.payload.userId,
              email: eventData.payload.email,
              name: eventData.payload.name,
            })
            .returning();

          participantId = newParticipant?.id;
        }

        // If referral code provided, find the referral
        if (eventData.payload.referralCode) {
          // Find referral by code (assuming referralCode maps to a referral link slug)
          // This is simplified - in production you'd have proper referral code tracking
          const [referralRecord] = await tx
            .select()
            .from(referral)
            .where(eq(referral.externalId, eventData.payload.referralCode))
            .limit(1);

          if (referralRecord) {
            referralId = referralRecord.id;
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
              eq(participant.externalId, eventData.payload.userId),
            ),
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

    // Create the event using our tRPC router (outside transaction for now)
    const newEvent = await api.events.create({
      productId: eventData.productId,
      programId: eventData.programId,
      eventType: eventData.eventType,
      participantId: result.participantId,
      referralId: result.referralId,
      metadata: result.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event processed successfully.",
        eventId: newEvent.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing event:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Check if the error is due to JSON parsing issues (e.g., empty or malformed body)
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      errorMessage = "Invalid JSON payload provided.";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}
