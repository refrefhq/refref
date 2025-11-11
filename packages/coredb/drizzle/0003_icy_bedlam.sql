CREATE TABLE IF NOT EXISTS "org" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	CONSTRAINT "org_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" RENAME TO "product";--> statement-breakpoint
ALTER TABLE "project_secrets" RENAME TO "product_secrets";--> statement-breakpoint
ALTER TABLE "project_user" RENAME TO "product_user";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "invitation" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "participant" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "program" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "product_secrets" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "product_user" RENAME COLUMN "project_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "participant" DROP CONSTRAINT "participant_project_id_external_id_unique";--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "project_slug_unique";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "event_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "participant" DROP CONSTRAINT "participant_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "program" DROP CONSTRAINT "program_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "product_secrets" DROP CONSTRAINT "project_secrets_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "product_user" DROP CONSTRAINT "project_user_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "product_user" DROP CONSTRAINT "project_user_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "event_project_id_idx";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "org_id" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_user" ADD CONSTRAINT "org_user_org_id_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_user" ADD CONSTRAINT "org_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_org_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_org_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participant" ADD CONSTRAINT "participant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program" ADD CONSTRAINT "program_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_org_id_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_secrets" ADD CONSTRAINT "product_secrets_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_user" ADD CONSTRAINT "product_user_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_user" ADD CONSTRAINT "product_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_product_id_idx" ON "event" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "active_project_id";--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_product_id_external_id_unique" UNIQUE("product_id","external_id");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_slug_unique" UNIQUE("slug");