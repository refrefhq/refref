import { z } from "zod";
import { widgetConfigSchema } from "./widget-config";

export const programTemplateStepKeySchema = z.enum(["brand", "reward"]);
export type ProgramTemplateStepKeyType = z.infer<
  typeof programTemplateStepKeySchema
>;

// ProgramTemplateStepConfig Zod schema and type
export const programTemplateStepConfigSchema = z.object({
  key: programTemplateStepKeySchema,
  title: z.string(),
  description: z.string().optional(),
});
export type ProgramTemplateStepConfigType = z.infer<
  typeof programTemplateStepConfigSchema
>;

// ProgramTemplateConfig Zod schema and type
export const programTemplateConfigSchema = z.object({
  schemaVersion: z.number(),
  steps: z.array(programTemplateStepConfigSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
});
export type ProgramTemplateConfigType = z.infer<
  typeof programTemplateConfigSchema
>;

// --- Action Config Schemas ---

// Enums for sub-configs
const trackingMethodEnum = z.enum([
  "unique_link",
  "coupon_code",
  "api",
  "manual",
]);
const verificationMethodEnum = z.enum(["automatic", "manual"]);

// Tracking configuration schema
const trackingConfigSchema = z.object({
  method: trackingMethodEnum,
  urlSettings: z
    .object({
      allowCustom: z.boolean().optional(),
      domain: z.string().url({ message: "Invalid URL" }).optional(),
    })
    .optional(),
});

// Verification configuration schema
const verificationConfigSchema = z.object({
  method: verificationMethodEnum,
});

export const RewardCurrencies = ["USD", "EUR", "GBP"] as const;

export const currencySchema = z.enum(RewardCurrencies);

export type CurrencyType = z.infer<typeof currencySchema>;

// Simplified reward configuration for initial implementation
// Only supporting cash rewards for referrers and discounts for referees
export const rewardConfigSchema = z.object({
  referrer: z.object({
    type: z.literal("cash"),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive(),
    currency: currencySchema,
  }).optional(),
  referee: z.object({
    type: z.literal("discount"),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive(),
    currency: currencySchema.optional(), // Only for fixed discounts
    minPurchaseAmount: z.number().positive().optional(),
    validityDays: z.number().int().positive().optional(),
  }).optional(),
});

export type RewardConfigType = z.infer<typeof rewardConfigSchema>;

// Brand config schema
export const brandConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  landingPageUrl: z.string().url({
    message: "Please enter a valid URL",
  }),
});
export type BrandConfigType = z.infer<typeof brandConfigSchema>;

// Notification schema
export const notificationConfigV1Schema = z
  .object({
    // Add notification config fields when implemented
  })
  .optional();
export type NotificationConfigV1Type = z.infer<
  typeof notificationConfigV1Schema
>;

// Program config schema
export const programConfigV1Schema = z.object({
  schemaVersion: z.literal(1),
  actions: z.array(z.any()).optional(), // Legacy field, being phased out
  brandConfig: brandConfigSchema.optional(),
  notification: notificationConfigV1Schema,
  templateConfig: programTemplateConfigSchema.optional(),
  widgetConfig: widgetConfigSchema,
});

export type ProgramConfigV1Type = z.infer<typeof programConfigV1Schema>;

export const configuredProgramTemplateSchema = z.object({
  rewardConfig: rewardConfigSchema.optional(), // New reward configuration
});
export type ConfiguredProgramTemplateType = z.infer<
  typeof configuredProgramTemplateSchema
>;
