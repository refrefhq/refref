CREATE TABLE "handoff_token" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"token_hash" text NOT NULL,
	"lead_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "referral_lead" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"program_id" text NOT NULL,
	"product_id" text NOT NULL,
	"referrer_participant_id" text NOT NULL,
	"refcode_id" text,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"consent_version" text,
	"consent_at" timestamp,
	"landing_url" text,
	"utm" jsonb,
	"ip" text,
	"user_agent" text,
	"qualified_referral_id" text,
	"matched_by" text,
	"qualified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"event_id" text NOT NULL,
	"dedupe_key" text,
	"endpoint_id" text,
	"product_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 8 NOT NULL,
	"last_status" text DEFAULT 'pending' NOT NULL,
	"last_error" text,
	"last_response_code" integer,
	"next_retry_at" timestamp DEFAULT now(),
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoint" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"secondary_secret" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"event_types" jsonb DEFAULT '["referral.created","referral.qualified"]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "handoff_token" ADD CONSTRAINT "handoff_token_lead_id_referral_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."referral_lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_lead" ADD CONSTRAINT "referral_lead_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_lead" ADD CONSTRAINT "referral_lead_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_lead" ADD CONSTRAINT "referral_lead_referrer_participant_id_participant_id_fk" FOREIGN KEY ("referrer_participant_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_lead" ADD CONSTRAINT "referral_lead_refcode_id_refcode_id_fk" FOREIGN KEY ("refcode_id") REFERENCES "public"."refcode"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_lead" ADD CONSTRAINT "referral_lead_qualified_referral_id_referral_id_fk" FOREIGN KEY ("qualified_referral_id") REFERENCES "public"."referral"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_endpoint_id_webhook_endpoint_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."webhook_endpoint"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoint" ADD CONSTRAINT "webhook_endpoint_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "handoff_token_hash_unique_idx" ON "handoff_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "handoff_token_lead_id_idx" ON "handoff_token" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "handoff_token_expires_at_idx" ON "handoff_token" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "referral_lead_email_idx" ON "referral_lead" USING btree ("email");--> statement-breakpoint
CREATE INDEX "referral_lead_status_idx" ON "referral_lead" USING btree ("status");--> statement-breakpoint
CREATE INDEX "referral_lead_code_idx" ON "referral_lead" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_lead_program_id_idx" ON "referral_lead" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "referral_lead_referrer_idx" ON "referral_lead" USING btree ("referrer_participant_id");--> statement-breakpoint
CREATE INDEX "referral_lead_created_at_idx" ON "referral_lead" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_delivery_event_id_unique_idx" ON "webhook_delivery" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_delivery_dedupe_key_unique_idx" ON "webhook_delivery" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "webhook_delivery_status_idx" ON "webhook_delivery" USING btree ("last_status");--> statement-breakpoint
CREATE INDEX "webhook_delivery_next_retry_at_idx" ON "webhook_delivery" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_event_type_idx" ON "webhook_delivery" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "webhook_endpoint_product_id_idx" ON "webhook_endpoint" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "webhook_endpoint_is_active_idx" ON "webhook_endpoint" USING btree ("is_active");