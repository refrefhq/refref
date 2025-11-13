CREATE TABLE IF NOT EXISTS "refcode" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"code" text NOT NULL,
	"participant_id" text NOT NULL,
	"program_id" text NOT NULL,
	"product_id" text NOT NULL,
	"global" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DROP TABLE "referral_link";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refcode" ADD CONSTRAINT "refcode_participant_id_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refcode" ADD CONSTRAINT "refcode_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refcode" ADD CONSTRAINT "refcode_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "refcode_global_code_unique_idx" ON "refcode" USING btree ("code") WHERE "refcode"."global" = true;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "refcode_local_code_unique_idx" ON "refcode" USING btree ("code","product_id") WHERE "refcode"."global" = false;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refcode_code_idx" ON "refcode" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refcode_participant_id_idx" ON "refcode" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refcode_program_id_idx" ON "refcode" USING btree ("program_id");