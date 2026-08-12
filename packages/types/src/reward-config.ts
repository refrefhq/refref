import { z } from "zod";

// Reward types enum (only cash and discount)
export const rewardTypeSchema = z.enum(["cash", "discount"]);
export type RewardTypeEnum = z.infer<typeof rewardTypeSchema>;

// Participant type enum
export const participantTypeSchema = z.enum(["referrer", "referee"]);
export type ParticipantTypeEnum = z.infer<typeof participantTypeSchema>;

// Reward unit enum. This is the canonical spelling used by reward rules.
export const rewardUnitSchema = z.enum(["fixed", "percent"]);
export type RewardUnitType = z.infer<typeof rewardUnitSchema>;

// The program setup UI and `rewardConfigSchema.valueType` spell the percentage
// unit "percentage", while reward rules store it as "percent". Rules written
// before the two were reconciled hold "percentage", which no consumer matched.
// Normalizing on read keeps those existing rules working.
const rewardUnitAliases: Record<string, RewardUnitType> = {
  percentage: "percent",
};

/**
 * Coerce a stored or user-supplied reward unit to its canonical spelling.
 * Returns undefined for absent or unrecognized units, which callers treat as
 * a flat amount.
 */
export function normalizeRewardUnit(
  unit: string | undefined | null,
): RewardUnitType | undefined {
  if (unit == null) return undefined;
  const aliased = rewardUnitAliases[unit] ?? unit;
  const parsed = rewardUnitSchema.safeParse(aliased);
  return parsed.success ? parsed.data : undefined;
}

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
    // for discount: percent, for cash: fixed. Accepts the legacy "percentage"
    // spelling written by the program setup flow and stores it as "percent".
    unit: z
      .preprocess(
        (value) =>
          typeof value === "string"
            ? (rewardUnitAliases[value] ?? value)
            : value,
        rewardUnitSchema,
      )
      .optional(),
    currency: z.string().optional(), // Currency code (USD, EUR, GBP, etc.)
    minPurchaseAmount: z.number().optional(), // Minimum purchase amount for discount
    validityDays: z.number().int().positive().optional(), // Discount validity period in days
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
  customData: z.record(z.string(), z.unknown()).optional(),
});
export type RewardMetadataV1Type = z.infer<typeof rewardMetadataV1Schema>;
