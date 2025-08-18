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
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import type {
  ProgramTemplateConfigType,
  ProgramConfigV1Type,
  EventDefinitionConfigV1Type,
  EventMetadataV1Type,
  RewardRuleConfigV1Type,
  RewardMetadataV1Type,
} from "@refref/types";

// Base table for common fields
export const baseFields = {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
};

export const user = pgTable("user", {
  ...baseFields,
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
  ...baseFields,
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeProjectId: text("active_project_id"),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  ...baseFields,
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
  ...baseFields,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const project = pgTable("project", {
  ...baseFields,
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  url: text("url"),
  metadata: text("metadata"),
  appType: text("app_type"),
  paymentProvider: text("payment_provider"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(1),
});

export const projectUser = pgTable("project_user", {
  ...baseFields,
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
});

export const invitation = pgTable("invitation", {
  ...baseFields,
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const apikey = pgTable("apikey", {
  ...baseFields,
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

export const programTemplate = pgTable("program_template", {
  ...baseFields,
  templateName: text("template_name").notNull(),
  description: text("description").notNull(),
  // Assuming config is part of the template definition based on ProgramConfigV1 type usage elsewhere
  config: jsonb("config").$type<ProgramTemplateConfigType>(),
});

export const program = pgTable("program", {
  ...baseFields,
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  programTemplateId: text("program_template_id")
    .notNull()
    .references(() => programTemplate.id, { onDelete: "restrict" }), // Restrict deletion if programs use it
  name: text("name").notNull(),
  status: text("status").notNull(), // e.g., "active", "inactive", "draft"
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  config: jsonb("config").$type<ProgramConfigV1Type>(),
});

export const eventDefinition = pgTable("event_definition", {
  ...baseFields,
  name: text("name").notNull(),
  type: text("type").notNull().unique(),
  description: text("description"),
  config: jsonb("config").$type<EventDefinitionConfigV1Type>(),
});

export const participant = pgTable(
  "participant",
  {
    ...baseFields,
    name: text("name"),
    email: text("email"),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
  },
  (participant) => ({
    projectExternalUnique: unique().on(
      participant.projectId,
      participant.externalId,
    ),
  }),
);

// Note: event table moved after referral table to fix forward reference

export const rewardRule = pgTable(
  "reward_rule",
  {
    ...baseFields,
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
  (table) => ({
    // Indexes for performance
    programIdIdx: index("reward_rule_program_id_idx").on(table.programId),
    typeIdx: index("reward_rule_type_idx").on(table.type),
    isActiveIdx: index("reward_rule_is_active_idx").on(table.isActive),
  }),
);

export const reward = pgTable(
  "reward",
  {
    ...baseFields,
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
  (table) => ({
    // Indexes for performance
    participantIdIdx: index("reward_participant_id_idx").on(
      table.participantId,
    ),
    programIdIdx: index("reward_program_id_idx").on(table.programId),
    rewardRuleIdIdx: index("reward_rule_id_idx").on(table.rewardRuleId),
    eventIdIdx: index("reward_event_id_idx").on(table.eventId),
    statusIdx: index("reward_status_idx").on(table.status),
    createdAtIdx: index("reward_created_at_idx").on(table.createdAt),
  }),
);

// Project secrets for JWT generation
export const projectSecrets = pgTable("project_secrets", {
  ...baseFields,
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
});

export const referralLink = pgTable("referral_link", {
  ...baseFields,
  // Core relationships
  participantId: text("participant_id")
    .notNull()
    .references(() => participant.id, { onDelete: "cascade" }),
  // Link details
  slug: text("slug").notNull().unique(), // Custom path segment
});

export const programRelations = relations(program, ({ one }) => ({
  programTemplate: one(programTemplate, {
    fields: [program.programTemplateId],
    references: [programTemplate.id],
  }),
}));

export const referral = pgTable("referral", {
  ...baseFields,
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
    ...baseFields,
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
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
  (table) => ({
    // Indexes for performance
    projectIdIdx: index("event_project_id_idx").on(table.projectId),
    programIdIdx: index("event_program_id_idx").on(table.programId),
    participantIdIdx: index("event_participant_id_idx").on(table.participantId),
    referralIdIdx: index("event_referral_id_idx").on(table.referralId),
    eventDefinitionIdIdx: index("event_definition_id_idx").on(
      table.eventDefinitionId,
    ),
    statusIdx: index("event_status_idx").on(table.status),
    createdAtIdx: index("event_created_at_idx").on(table.createdAt),
  }),
);

export const referralRelations = relations(referral, ({ one }) => ({
  referrer: one(participant, {
    fields: [referral.referrerId],
    references: [participant.id],
  }),
}));
