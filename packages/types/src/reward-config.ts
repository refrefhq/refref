import { z } from "zod";

// Reward types enum (only cash and discount)
export const rewardTypeSchema = z.enum(["cash", "discount"]);
export type RewardTypeEnum = z.infer<typeof rewardTypeSchema>;

// Participant type enum
export const participantTypeSchema = z.enum(["referrer", "referee"]);
export type ParticipantTypeEnum = z.infer<typeof participantTypeSchema>;

// Reward Rule Config V1 (simplified - event triggers only)
export const rewardRuleConfigV1Schema = z.object({
  schemaVersion: z.literal(1),
  trigger: z.object({
    event: z.string(), // "purchase", "signup", etc.
  }),
  participantType: participantTypeSchema,
  reward: z.object({
    type: rewardTypeSchema,
    amount: z.number(),
    unit: z.enum(["fixed", "percent"]).optional(), // for discount: percent, for cash: fixed
  }),
});
export type RewardRuleConfigV1Type = z.infer<typeof rewardRuleConfigV1Schema>;

// Reward Metadata V1 (simplified for cash and discount only)
export const rewardMetadataV1Schema = z.object({
  schemaVersion: z.literal(1),
  // For discount rewards
  couponCode: z.string().optional(),
  validUntil: z.string().optional(), // ISO date string
  minPurchaseAmount: z.number().optional(),
  // General
  notes: z.string().optional(),
  customData: z.record(z.unknown()).optional(),
});
export type RewardMetadataV1Type = z.infer<typeof rewardMetadataV1Schema>;
