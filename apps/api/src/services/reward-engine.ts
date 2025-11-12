import { schema } from "@refref/coredb";
const {
  event: eventTable,
  eventDefinition,
  rewardRule,
  reward: rewardTable,
  program: programTable,
  participant,
  referral,
} = schema;
import { eq, and, desc } from "drizzle-orm";
import type {
  RewardRuleConfigV1Type,
  EventMetadataV1Type,
  RewardMetadataV1Type,
} from "@refref/types";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

type DbType = PostgresJsDatabase<typeof schema>;

/**
 * Process an event and create rewards based on matching rules
 * Uses database transactions to ensure data consistency
 */
export async function processEventForRewards(db: DbType, eventId: string) {
  try {
    // Use a transaction for the entire reward processing operation
    return await db.transaction(async (tx) => {
      // Get the event with all related data
      const [eventData] = await tx
        .select({
          event: eventTable,
          eventDefinition: eventDefinition,
          program: programTable,
          participant: participant,
          referral: referral,
        })
        .from(eventTable)
        .leftJoin(
          eventDefinition,
          eq(eventTable.eventDefinitionId, eventDefinition.id),
        )
        .leftJoin(programTable, eq(eventTable.programId, programTable.id))
        .leftJoin(participant, eq(eventTable.participantId, participant.id))
        .leftJoin(referral, eq(eventTable.referralId, referral.id))
        .where(eq(eventTable.id, eventId))
        .limit(1);

      if (!eventData || !eventData.eventDefinition) {
        console.error(`Event ${eventId} not found or missing definition`);
        await updateEventStatusInTransaction(tx, eventId, "failed");
        return [];
      }

      // If no program is associated, mark as processed (no rewards to create)
      if (!eventData.program) {
        console.log(
          `Event ${eventId} has no associated program, skipping reward processing`,
        );
        await updateEventStatusInTransaction(tx, eventId, "processed");
        return [];
      }

      // Get all active reward rules for this program
      const rules = await tx
        .select()
        .from(rewardRule)
        .where(
          and(
            eq(rewardRule.programId, eventData.program.id),
            eq(rewardRule.isActive, true),
          ),
        )
        .orderBy(desc(rewardRule.priority));

      if (rules.length === 0) {
        console.log(
          `No active reward rules found for program ${eventData.program.id}`,
        );
        await updateEventStatusInTransaction(tx, eventId, "processed");
        return [];
      }

      // Process each matching rule
      const createdRewards = [];
      for (const rule of rules) {
        const ruleConfig = rule.config as RewardRuleConfigV1Type;

        // Check if rule matches this event type
        if (ruleConfig.trigger.event !== eventData.eventDefinition.type) {
          continue;
        }

        // Determine the participant for the reward
        let rewardParticipantId: string | null = null;

        if (ruleConfig.participantType === "referrer" && eventData.referral) {
          // Reward goes to the referrer
          rewardParticipantId = eventData.referral.referrerId;
        } else if (
          ruleConfig.participantType === "referee" &&
          eventData.participant
        ) {
          // Reward goes to the referee
          rewardParticipantId = eventData.participant.id;
        }

        if (!rewardParticipantId) {
          console.log(
            `No participant found for rule ${rule.id} and event ${eventId}`,
          );
          continue;
        }

        // Check for duplicate rewards (idempotency) within the transaction
        const [existingReward] = await tx
          .select()
          .from(rewardTable)
          .where(
            and(
              eq(rewardTable.eventId, eventId),
              eq(rewardTable.rewardRuleId, rule.id),
              eq(rewardTable.participantId, rewardParticipantId),
            ),
          )
          .limit(1);

        if (existingReward) {
          console.log(
            `Reward already exists for event ${eventId} and rule ${rule.id}`,
          );
          continue;
        }

        // Calculate reward amount
        const rewardAmount = calculateRewardAmount(
          ruleConfig.reward,
          eventData.event.metadata as EventMetadataV1Type,
        );

        // Create reward metadata
        const rewardMetadata: RewardMetadataV1Type = {
          schemaVersion: 1,
          notes: `Generated from ${eventData.eventDefinition.name} event`,
        };

        // Create the reward within the transaction
        const [newReward] = await tx
          .insert(rewardTable)
          .values({
            participantId: rewardParticipantId,
            programId: eventData.program.id,
            rewardRuleId: rule.id,
            eventId: eventId,
            rewardType: ruleConfig.reward.type,
            amount: rewardAmount.toString(),
            currency: "USD", // Default currency
            status:
              ruleConfig.reward.type === "cash"
                ? "pending_disbursal"
                : "approved",
            metadata: rewardMetadata,
          })
          .returning();

        if (newReward) {
          createdRewards.push(newReward);
          console.log(`Created reward ${newReward.id} for event ${eventId}`);
        }
      }

      // Update event status within the transaction
      await updateEventStatusInTransaction(tx, eventId, "processed");

      console.log(
        `Successfully processed event ${eventId}, created ${createdRewards.length} rewards`,
      );
      return createdRewards;
    });
  } catch (error) {
    console.error(`Error processing event ${eventId} for rewards:`, error);

    // Try to update event status to failed outside of transaction
    try {
      await db
        .update(eventTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(eventTable.id, eventId));
    } catch (updateError) {
      console.error(`Failed to update event status to failed:`, updateError);
    }

    throw error;
  }
}

/**
 * Calculate reward amount based on rule configuration and event metadata
 */
function calculateRewardAmount(
  rewardConfig: RewardRuleConfigV1Type["reward"],
  eventMetadata?: EventMetadataV1Type,
): number {
  const baseAmount = rewardConfig.amount;

  if (rewardConfig.unit === "fixed") {
    return baseAmount;
  }

  if (rewardConfig.unit === "percent") {
    // For percentage rewards, calculate based on order amount if available
    if (eventMetadata?.orderAmount) {
      return (eventMetadata.orderAmount * baseAmount) / 100;
    }
    // If orderAmount is not available for a percentage reward, the value is 0
    return 0;
  }

  return baseAmount;
}

/**
 * Update event status within a transaction
 */
async function updateEventStatusInTransaction(
  tx: Parameters<Parameters<DbType["transaction"]>[0]>[0],
  eventId: string,
  status: "pending" | "processed" | "failed",
) {
  await tx
    .update(eventTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(eventTable.id, eventId));
}
