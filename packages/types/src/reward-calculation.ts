import type { EventMetadataV1Type } from "./event-config";
import {
  normalizeRewardUnit,
  type RewardRuleConfigV1Type,
} from "./reward-config";

/**
 * Calculate the payout for a reward rule.
 *
 * Percentage rules are resolved against the order amount carried on the event.
 * A percentage rule with no order amount to apply to has no meaningful payout,
 * so it resolves to 0 — returning the raw percentage would pay "10%" out as a
 * flat 10.
 *
 * Shared by the API and webapp reward engines so both apply the same money
 * rules.
 */
export function calculateRewardAmount(
  rewardConfig: RewardRuleConfigV1Type["reward"],
  eventMetadata?: EventMetadataV1Type,
): number {
  const baseAmount = rewardConfig.amount;

  if (normalizeRewardUnit(rewardConfig.unit) === "percent") {
    if (eventMetadata?.orderAmount) {
      return (eventMetadata.orderAmount * baseAmount) / 100;
    }
    return 0;
  }

  return baseAmount;
}
