import { z } from "zod";

/**
 * Outbound webhook contract for the Welfie referral fork.
 *
 * Two events are emitted:
 *   - `referral.created`   when the referee submits the public form.
 *   - `referral.qualified` when that referee later signs up in Welfie.
 *
 * The receiver (welfie-backend) verifies the HMAC signature and timestamp
 * BEFORE parsing the body, then upserts on `event_id` (idempotency key).
 */

export const WEBHOOK_EVENT_TYPES = [
  "referral.created",
  "referral.qualified",
] as const;

export const webhookEventTypeSchema = z.enum(WEBHOOK_EVENT_TYPES);
export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;

/** Signature headers sent on every delivery. */
export const WEBHOOK_SIGNATURE_HEADER = "x-refref-signature";
export const WEBHOOK_TIMESTAMP_HEADER = "x-refref-timestamp";
export const WEBHOOK_EVENT_ID_HEADER = "x-refref-event-id";
export const WEBHOOK_EVENT_TYPE_HEADER = "x-refref-event-type";

/** Reject deliveries whose timestamp is skewed beyond this many seconds. */
export const WEBHOOK_MAX_SKEW_SECONDS = 120;

const consentSchema = z.object({
  version: z.string(),
  accepted_at: z.string().datetime(),
});

const attributionSchema = z.object({
  landing_url: z.string(),
  utm: z.record(z.string(), z.string()).default({}),
  ip: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

export const referralCreatedPayloadSchema = z.object({
  event: z.literal("referral.created"),
  event_id: z.string(),
  occurred_at: z.string().datetime(),
  program_id: z.string(),
  referral: z.object({
    id: z.string(),
    code: z.string(),
    status: z.literal("pending"),
  }),
  referrer: z.object({
    participant_id: z.string(),
    external_id: z.string().nullable(),
    email: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
  }),
  referee: z.object({
    email: z.string().email(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email_verified: z.boolean(),
    form_fields: z.record(z.string(), z.unknown()).default({}),
  }),
  consent: consentSchema,
  attribution: attributionSchema,
});
export type ReferralCreatedPayload = z.infer<
  typeof referralCreatedPayloadSchema
>;

export const referralQualifiedPayloadSchema = z.object({
  event: z.literal("referral.qualified"),
  event_id: z.string(),
  occurred_at: z.string().datetime(),
  program_id: z.string(),
  referral: z.object({
    id: z.string(),
    code: z.string(),
    status: z.literal("qualified"),
  }),
  referee: z.object({
    email: z.string().email(),
    external_id: z.string().nullable(),
  }),
  reward: z
    .object({
      id: z.string().nullable(),
      type: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
    })
    .nullable(),
  // "handoff_token" | "email_reconciliation"
  matched_by: z.string(),
});
export type ReferralQualifiedPayload = z.infer<
  typeof referralQualifiedPayloadSchema
>;

export const webhookPayloadSchema = z.discriminatedUnion("event", [
  referralCreatedPayloadSchema,
  referralQualifiedPayloadSchema,
]);
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
