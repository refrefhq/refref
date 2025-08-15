import { z } from "zod";
import { currencySchema } from "./program-config";

// New simplified reward step schema
export const programTemplateRewardStepSchemaV2 = z.object({
  referrerReward: z.object({
    enabled: z.boolean(),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive(),
    currency: currencySchema,
  }),
  refereeReward: z.object({
    enabled: z.boolean(),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive(),
    currency: currencySchema.optional(), // Only for fixed discounts
    minPurchaseAmount: z.number().positive().optional(),
    validityDays: z.number().int().positive().optional(),
  }),
});

export type ProgramTemplateRewardStepV2Type = z.infer<
  typeof programTemplateRewardStepSchemaV2
>;

// Keep old schema for backward compatibility
/** @deprecated Use programTemplateRewardStepSchemaV2 instead */
export const programTemplateRewardStepSchema = z.object({
  type: z.literal("cash"),
  defaultCurrency: z.string().min(1),
  rewardType: z.enum(["percentage", "fixed"]),
  revenueSharePercentage: z.number().min(0).max(50),
  revenueSharePeriodType: z.literal("lifetime"),
  cap: z.number().min(0),
  newUserRewardType: z.enum(["percentage", "fixed"]),
  newUserRewardMonths: z.number().min(1),
  newUserRewardValue: z.number().min(0),
});

/** @deprecated Use ProgramTemplateRewardStepV2Type instead */
export type ProgramTemplateRewardStepType = z.infer<
  typeof programTemplateRewardStepSchema
>;
