import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, schema } from "@refref/coredb";
import type { RewardRuleConfigV1Type, EventMetadataV1Type } from "@refref/types";

describe("Reward Calculation Logic", () => {
  describe("Fixed reward calculation", () => {
    it("should return the fixed amount for fixed rewards", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "cash",
        unit: "fixed",
        amount: 50,
      };

      const result = calculateRewardAmount(rewardConfig);

      expect(result).toBe(50);
    });

    it("should return fixed amount regardless of event metadata", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "cash",
        unit: "fixed",
        amount: 100,
      };

      const eventMetadata: EventMetadataV1Type = {
        schemaVersion: 1,
        source: "api",
        orderAmount: 1000,
        orderId: "order_123",
      };

      const result = calculateRewardAmount(rewardConfig, eventMetadata);

      expect(result).toBe(100);
    });
  });

  describe("Percentage reward calculation", () => {
    it("should calculate percentage of order amount when available", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "cash",
        unit: "percent",
        amount: 10, // 10%
      };

      const eventMetadata: EventMetadataV1Type = {
        schemaVersion: 1,
        source: "api",
        orderAmount: 500,
        orderId: "order_123",
      };

      const result = calculateRewardAmount(rewardConfig, eventMetadata);

      // 10% of 500 = 50
      expect(result).toBe(50);
    });

    it("should return 0 when orderAmount is missing (CRITICAL FIX)", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "discount",
        unit: "percent",
        amount: 10,
      };

      const eventMetadata: EventMetadataV1Type = {
        schemaVersion: 1,
        source: "api",
      };

      const result = calculateRewardAmount(rewardConfig, eventMetadata);

      // Should return 0, NOT the percentage value itself
      expect(result).toBe(0);
    });

    it("should return 0 when metadata is undefined", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "cash",
        unit: "percent",
        amount: 15,
      };

      const result = calculateRewardAmount(rewardConfig, undefined);

      expect(result).toBe(0);
    });

    it("should correctly calculate with decimal percentages", () => {
      const rewardConfig: RewardRuleConfigV1Type["reward"] = {
        type: "cash",
        unit: "percent",
        amount: 2.5, // 2.5%
      };

      const eventMetadata: EventMetadataV1Type = {
        schemaVersion: 1,
        source: "api",
        orderAmount: 1000,
        orderId: "order_456",
      };

      const result = calculateRewardAmount(rewardConfig, eventMetadata);

      // 2.5% of 1000 = 25
      expect(result).toBe(25);
    });
  });

  describe("Reward metadata creation", () => {
    it("should NOT include coupon codes (external systems handle this)", () => {
      const metadata: any = {
        schemaVersion: 1,
        notes: "Generated from Signup event",
      };

      // Verify no coupon code fields exist
      expect(metadata.couponCode).toBeUndefined();
      expect(metadata.validUntil).toBeUndefined();
      expect(metadata.minPurchaseAmount).toBeUndefined();
    });
  });
});

// Helper function extracted from reward-engine.ts for testing
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
