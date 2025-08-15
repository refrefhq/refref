import { z } from "zod";

// Event Definition Config V1
export const eventDefinitionConfigV1Schema = z.object({
  schemaVersion: z.literal(1),
  requiredFields: z.array(z.string()).optional(),
  validationRules: z.record(z.unknown()).optional(),
});
export type EventDefinitionConfigV1Type = z.infer<
  typeof eventDefinitionConfigV1Schema
>;

// Event Metadata V1
export const eventMetadataV1Schema = z.object({
  schemaVersion: z.literal(1),
  source: z.enum(["auto", "api"]).optional(),
  reason: z.string().optional(),
  orderAmount: z.number().optional(),
  orderId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  customData: z.record(z.unknown()).optional(),
});
export type EventMetadataV1Type = z.infer<typeof eventMetadataV1Schema>;
