import { schema } from "@refref/coredb";
const { event: eventTable, eventDefinition, participant } = schema;
import { eq } from "drizzle-orm";
import type { EventMetadataV1Type } from "@refref/types";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { processEventForRewards } from "./reward-engine.js";

type DbType = PostgresJsDatabase<typeof schema>;

export interface CreateEventInput {
  productId: string;
  programId?: string;
  eventType: string;
  participantId?: string;
  referralId?: string;
  metadata?: EventMetadataV1Type;
}

/**
 * Create a new event and trigger reward processing
 */
export async function createEvent(db: DbType, input: CreateEventInput) {
  // Validate event definition exists
  const [eventDef] = await db
    .select()
    .from(eventDefinition)
    .where(eq(eventDefinition.type, input.eventType))
    .limit(1);

  if (!eventDef) {
    throw new Error(`Event definition not found for type: ${input.eventType}`);
  }

  // Validate participant if provided
  if (input.participantId) {
    const [participantRecord] = await db
      .select()
      .from(participant)
      .where(eq(participant.id, input.participantId))
      .limit(1);

    if (!participantRecord) {
      throw new Error("Participant not found");
    }
  }

  // Create the event
  const [newEvent] = await db
    .insert(eventTable)
    .values({
      productId: input.productId,
      programId: input.programId || null,
      participantId: input.participantId || null,
      referralId: input.referralId || null,
      eventDefinitionId: eventDef.id,
      status: "pending",
      metadata: input.metadata || { schemaVersion: 1, source: "api" },
    })
    .returning();

  if (!newEvent) {
    throw new Error("Failed to create event");
  }

  // Process event for rewards asynchronously
  // In production, this would be a queue job
  processEventForRewards(db, newEvent.id).catch((error) => {
    console.error("Failed to process event for rewards:", error);
  });

  return newEvent;
}
