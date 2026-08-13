// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  text,
  boolean,
  jsonb,
  decimal,
  unique,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId as createCuid } from "@paralleldrive/cuid2";
import { createId, isValidEntityType } from "@refref/id";
import type {
  ProgramConfigV1Type,
  EventDefinitionConfigV1Type,
  EventMetadataV1Type,
  RewardRuleConfigV1Type,
  RewardMetadataV1Type,
} from "@refref/types";

// Base table for common fields
export const baseFields = (entityType: string) => {
  return {
    id: text("id")
      .primaryKey()
      .$defaultFn(() =>
        entityType && isValidEntityType(entityType)
          ? createId(entityType)
          : createCuid(),
      ),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  };
};

export const user = pgTable("user", {
  ...baseFields("user"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  ...baseFields("session"),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  ...baseFields("account"),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
});

export const verification = pgTable("verification", {
  ...baseFields("verification"),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const org = pgTable("org", {
  ...baseFields("org"),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  metadata: text("metadata"),
});

export const orgUser = pgTable("org_user", {
  ...baseFields("orgUser"),
  orgId: text("org_id")
    .notNull()
    .references(() => org.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
});

export const product = pgTable("product", {
  ...baseFields("product"),
  orgId: text("org_id").references(() => org.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  url: text("url"),
  metadata: text("metadata"),
  appType: text("app_type"),
  useCase: text("use_case"),
  paymentProvider: text("payment_provider"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(1),
});

export const productUser = pgTable("product_user", {
  ...baseFields("productUser"),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
});

export const invitation = pgTable("invitation", {
  ...baseFields("invitation"),
  organizationId: text("organization_id").references(() => org.id, {
    onDelete: "cascade",
  }),
  productId: text("product_id").references(() => product.id, {
    onDelete: "cascade",
  }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const apikey = pgTable("apikey", {
  ...baseFields("apikey"),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  refillInterval: integer("refill_interval"),
  refillAmount: integer("refill_amount"),
  lastRefillAt: timestamp("last_refill_at"),
  enabled: boolean("enabled"),
  rateLimitEnabled: boolean("rate_limit_enabled"),
  rateLimitTimeWindow: integer("rate_limit_time_window"),
  rateLimitMax: integer("rate_limit_max"),
  requestCount: integer("request_count"),
  remaining: integer("remaining"),
  lastRequest: timestamp("last_request"),
  expiresAt: timestamp("expires_at"),
  permissions: text("permissions"),
  metadata: text("metadata"),
});

export const program = pgTable("program", {
  ...baseFields("program"),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  programTemplateId: text("program_template_id").notNull(), // Template ID from PROGRAM_TEMPLATES constants
  name: text("name").notNull(),
  status: text("status").notNull(), // e.g., "active", "inactive", "draft"
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  config: jsonb("config").$type<ProgramConfigV1Type>(),
});

export const programUser = pgTable("program_user", {
  ...baseFields("programUser"),
  programId: text("program_id")
    .notNull()
    .references(() => program.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
});

export const eventDefinition = pgTable("event_definition", {
  ...baseFields("eventDefinition"),
  name: text("name").notNull(),
  type: text("type").notNull().unique(),
  description: text("description"),
  config: jsonb("config").$type<EventDefinitionConfigV1Type>(),
});

export const participant = pgTable(
  "participant",
  {
    ...baseFields("participant"),
    name: text("name"),
    email: text("email"),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
  },
  (table) => [unique().on(table.productId, table.externalId)],
);

// Note: event table moved after referral table to fix forward reference

export const rewardRule = pgTable(
  "reward_rule",
  {
    ...baseFields("rewardRule"),
    programId: text("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull(),
    config: jsonb("config").notNull().$type<RewardRuleConfigV1Type>(),
    priority: integer("priority").default(0),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    // Indexes for performance
    index("reward_rule_program_id_idx").on(table.programId),
    index("reward_rule_type_idx").on(table.type),
    index("reward_rule_is_active_idx").on(table.isActive),
  ],
);

export const reward = pgTable(
  "reward",
  {
    ...baseFields("reward"),
    participantId: text("participant_id")
      .notNull()
      .references(() => participant.id, { onDelete: "cascade" }),
    programId: text("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    rewardRuleId: text("reward_rule_id").references(() => rewardRule.id),
    eventId: text("event_id").references(() => event.id),
    rewardType: text("reward_type").notNull(), // e.g., "cash", "discount", "gift_card"
    amount: decimal("amount", { precision: 10, scale: 2 }), // Example precision/scale
    currency: text("currency"), // e.g., "USD", "EUR"
    status: text("status").notNull(), // e.g., "pending_disbursal", "disbursed"
    disbursedAt: timestamp("disbursed_at"),
    metadata: jsonb("metadata").$type<RewardMetadataV1Type>(),
  },
  (table) => [
    // Indexes for performance
    index("reward_participant_id_idx").on(table.participantId),
    index("reward_program_id_idx").on(table.programId),
    index("reward_rule_id_idx").on(table.rewardRuleId),
    index("reward_event_id_idx").on(table.eventId),
    index("reward_status_idx").on(table.status),
    index("reward_created_at_idx").on(table.createdAt),
  ],
);

// Product secrets for JWT generation
export const productSecrets = pgTable("product_secret", {
  ...baseFields("productSecrets"),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
});

export const refcode = pgTable(
  "refcode",
  {
    ...baseFields("refcode"),
    // Auto-generated 7-character code (e.g., "abc1234")
    code: text("code").notNull(),
    // Core relationships
    participantId: text("participant_id")
      .notNull()
      .references(() => participant.id, { onDelete: "cascade" }),
    programId: text("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Unique index for globally unique codes
    uniqueIndex("refcode_code_unique_idx").on(table.code),
    // Index for participant lookups
    index("refcode_participant_id_idx").on(table.participantId),
    // Index for program lookups
    index("refcode_program_id_idx").on(table.programId),
    // Index for product lookups
    index("refcode_product_id_idx").on(table.productId),
  ],
);

export const reflink = pgTable(
  "reflink",
  {
    ...baseFields("reflink"),
    // Vanity URL slug (e.g., "john-doe", "ceo", "founder-2024")
    slug: text("slug").notNull(),
    // Reference to the underlying refcode
    refcodeId: text("refcode_id")
      .notNull()
      .references(() => refcode.id, { onDelete: "cascade" }),
    // Product scoping for vanity links
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Unique vanity slug per product
    uniqueIndex("reflink_slug_product_unique_idx").on(
      table.slug,
      table.productId,
    ),
    // Index for fast slug lookups (hot path for referral redirects)
    index("reflink_slug_idx").on(table.slug),
    // Index for refcode lookups
    index("reflink_refcode_id_idx").on(table.refcodeId),
    // Index for product lookups
    index("reflink_product_id_idx").on(table.productId),
  ],
);

// Relations for refcode
export const refcodeRelations = relations(refcode, ({ one, many }) => ({
  participant: one(participant, {
    fields: [refcode.participantId],
    references: [participant.id],
  }),
  program: one(program, {
    fields: [refcode.programId],
    references: [program.id],
  }),
  product: one(product, {
    fields: [refcode.productId],
    references: [product.id],
  }),
  reflinks: many(reflink),
}));

// Relations for reflink
export const reflinkRelations = relations(reflink, ({ one }) => ({
  refcode: one(refcode, {
    fields: [reflink.refcodeId],
    references: [refcode.id],
  }),
  product: one(product, {
    fields: [reflink.productId],
    references: [product.id],
  }),
}));

// Relations for participant
export const participantRelations = relations(participant, ({ one, many }) => ({
  product: one(product, {
    fields: [participant.productId],
    references: [product.id],
  }),
  refcodes: many(refcode),
}));

export const referral = pgTable("referral", {
  ...baseFields("referral"),
  referrerId: text("referrer_id")
    .notNull()
    .references(() => participant.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  email: text("email"),
  name: text("name"),
});

// Event table (moved here to fix forward reference to referral table)
export const event = pgTable(
  "event",
  {
    ...baseFields("event"),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    programId: text("program_id").references(() => program.id, {
      onDelete: "cascade",
    }),
    participantId: text("participant_id").references(() => participant.id),
    referralId: text("referral_id").references(() => referral.id),
    eventDefinitionId: text("event_definition_id")
      .notNull()
      .references(() => eventDefinition.id),
    status: text("status").notNull().default("pending"),
    metadata: jsonb("metadata").$type<EventMetadataV1Type>(),
  },
  (table) => [
    // Indexes for performance
    index("event_product_id_idx").on(table.productId),
    index("event_program_id_idx").on(table.programId),
    index("event_participant_id_idx").on(table.participantId),
    index("event_referral_id_idx").on(table.referralId),
    index("event_definition_id_idx").on(table.eventDefinitionId),
    index("event_status_idx").on(table.status),
    index("event_created_at_idx").on(table.createdAt),
  ],
);

export const referralRelations = relations(referral, ({ one }) => ({
  referrer: one(participant, {
    fields: [referral.referrerId],
    references: [participant.id],
  }),
}));

// ===========================================================================
// Welfie referral fork additions
// ---------------------------------------------------------------------------
// These tables are additive (never modify upstream tables) so the fork stays
// easy to rebase onto refrefhq/refref. They power the self-hosted referee
// form, the single-use signup hand-off, and the outbound webhook dispatcher.
// ===========================================================================

/**
 * A lead captured by the public referee form BEFORE the friend has a Welfie
 * account. This is deliberately a new table rather than an extension of
 * `referral`, because `referral.externalId` is NOT NULL (it is the referee's
 * Welfie user id) and does not exist yet at form-submission time. When the
 * friend later signs up, the lead is reconciled and a real `referral` row is
 * created, linked back here via `qualifiedReferralId`.
 */
export const referralLead = pgTable(
  "referral_lead",
  {
    ...baseFields("referralLead"),
    programId: text("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    // The referrer whose code was used.
    referrerParticipantId: text("referrer_participant_id")
      .notNull()
      .references(() => participant.id, { onDelete: "cascade" }),
    // Traceability back to the exact code row that was resolved.
    refcodeId: text("refcode_id").references(() => refcode.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    // Referee-supplied fields (kept minimal by policy: email + first name).
    email: text("email").notNull(),
    firstName: text("first_name"),
    // Lifecycle: pending -> qualified | expired | rejected.
    status: text("status").notNull().default("pending"),
    emailVerified: boolean("email_verified").notNull().default(false),
    // Consent is stored as versioned text + timestamp, not a bare boolean.
    consentVersion: text("consent_version"),
    consentAt: timestamp("consent_at"),
    // Attribution context.
    landingUrl: text("landing_url"),
    utm: jsonb("utm").$type<Record<string, string>>(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    // Set when the lead is reconciled at signup.
    qualifiedReferralId: text("qualified_referral_id").references(
      () => referral.id,
      { onDelete: "set null" },
    ),
    // "handoff_token" | "email_reconciliation" — for attribution disputes.
    matchedBy: text("matched_by"),
    qualifiedAt: timestamp("qualified_at"),
  },
  (table) => [
    index("referral_lead_email_idx").on(table.email),
    index("referral_lead_status_idx").on(table.status),
    index("referral_lead_code_idx").on(table.code),
    index("referral_lead_program_id_idx").on(table.programId),
    index("referral_lead_referrer_idx").on(table.referrerParticipantId),
    index("referral_lead_created_at_idx").on(table.createdAt),
  ],
);

/**
 * Single-use, short-lived opaque tokens for the signup redirect. We store only
 * the SHA-256 hash of the token; the plaintext lives solely in the redirect URL
 * and is exchanged server-side by welfie-backend.
 */
export const handoffToken = pgTable(
  "handoff_token",
  {
    ...baseFields("handoffToken"),
    tokenHash: text("token_hash").notNull(),
    leadId: text("lead_id")
      .notNull()
      .references(() => referralLead.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    consumedAt: timestamp("consumed_at"),
  },
  (table) => [
    uniqueIndex("handoff_token_hash_unique_idx").on(table.tokenHash),
    index("handoff_token_lead_id_idx").on(table.leadId),
    index("handoff_token_expires_at_idx").on(table.expiresAt),
  ],
);

/**
 * Outbound webhook endpoint configuration, per product. `secret` is the active
 * HMAC signing key; `secondarySecret` supports rotation with overlap (the
 * receiver accepts both while a rotation is in flight).
 */
export const webhookEndpoint = pgTable(
  "webhook_endpoint",
  {
    ...baseFields("webhookEndpoint"),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    secret: text("secret").notNull(),
    secondarySecret: text("secondary_secret"),
    isActive: boolean("is_active").notNull().default(true),
    // Subscribed event types, e.g. ["referral.created","referral.qualified"].
    eventTypes: jsonb("event_types")
      .$type<string[]>()
      .notNull()
      .default(["referral.created", "referral.qualified"]),
  },
  (table) => [
    index("webhook_endpoint_product_id_idx").on(table.productId),
    index("webhook_endpoint_is_active_idx").on(table.isActive),
  ],
);

/**
 * Outbound delivery log AND dead-letter queue. One row per (event -> endpoint).
 * `eventId` is the idempotency key that travels to the receiver; `dedupeKey`
 * guards against enqueuing the same logical event twice (e.g. a double form
 * submit). The webhook worker polls this table.
 */
export const webhookDelivery = pgTable(
  "webhook_delivery",
  {
    ...baseFields("webhookDelivery"),
    // Idempotency key sent to the receiver as the payload `event_id`.
    eventId: text("event_id").notNull(),
    // Optional application-level dedupe key (not sent to the receiver).
    dedupeKey: text("dedupe_key"),
    endpointId: text("endpoint_id").references(() => webhookEndpoint.id, {
      onDelete: "set null",
    }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(8),
    // pending | delivering | delivered | failed | dead_letter
    lastStatus: text("last_status").notNull().default("pending"),
    lastError: text("last_error"),
    lastResponseCode: integer("last_response_code"),
    nextRetryAt: timestamp("next_retry_at").defaultNow(),
    deliveredAt: timestamp("delivered_at"),
  },
  (table) => [
    uniqueIndex("webhook_delivery_event_id_unique_idx").on(table.eventId),
    uniqueIndex("webhook_delivery_dedupe_key_unique_idx").on(table.dedupeKey),
    index("webhook_delivery_status_idx").on(table.lastStatus),
    index("webhook_delivery_next_retry_at_idx").on(table.nextRetryAt),
    index("webhook_delivery_event_type_idx").on(table.eventType),
  ],
);

// --- Relations for the fork tables ---

export const referralLeadRelations = relations(
  referralLead,
  ({ one, many }) => ({
    program: one(program, {
      fields: [referralLead.programId],
      references: [program.id],
    }),
    product: one(product, {
      fields: [referralLead.productId],
      references: [product.id],
    }),
    referrer: one(participant, {
      fields: [referralLead.referrerParticipantId],
      references: [participant.id],
    }),
    refcode: one(refcode, {
      fields: [referralLead.refcodeId],
      references: [refcode.id],
    }),
    qualifiedReferral: one(referral, {
      fields: [referralLead.qualifiedReferralId],
      references: [referral.id],
    }),
    handoffTokens: many(handoffToken),
  }),
);

export const handoffTokenRelations = relations(handoffToken, ({ one }) => ({
  lead: one(referralLead, {
    fields: [handoffToken.leadId],
    references: [referralLead.id],
  }),
}));

export const webhookEndpointRelations = relations(
  webhookEndpoint,
  ({ one, many }) => ({
    product: one(product, {
      fields: [webhookEndpoint.productId],
      references: [product.id],
    }),
    deliveries: many(webhookDelivery),
  }),
);

export const webhookDeliveryRelations = relations(
  webhookDelivery,
  ({ one }) => ({
    endpoint: one(webhookEndpoint, {
      fields: [webhookDelivery.endpointId],
      references: [webhookEndpoint.id],
    }),
    product: one(product, {
      fields: [webhookDelivery.productId],
      references: [product.id],
    }),
  }),
);
