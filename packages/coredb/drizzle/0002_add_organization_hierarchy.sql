-- Migration: Add organization hierarchy (org -> project -> program)
-- This migration adds organization tables and updates existing tables to support the new hierarchy

-- Step 1: Create organization table
CREATE TABLE IF NOT EXISTS "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);

-- Step 2: Create organization_user table (org-level membership)
CREATE TABLE IF NOT EXISTS "organization_user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "organization_user_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "organization_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action
);

-- Step 3: Add organizationId to project table (nullable for migration)
ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "organization_id" text;
ALTER TABLE "project" ADD CONSTRAINT "project_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;

-- Step 4: Add organizationId to apikey table (nullable, optional scoping)
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "organization_id" text;
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;

-- Step 5: Rename activeProjectId to activeOrganizationId in session table
ALTER TABLE "session" RENAME COLUMN "active_project_id" TO "active_organization_id";

-- Step 6: Add organizationId to invitation table (for org-level invites)
ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "organization_id" text;
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;

-- Step 7: Make invitation.projectId nullable (since invites can be org-level OR project-level)
ALTER TABLE "invitation" ALTER COLUMN "project_id" DROP NOT NULL;

-- Note: Data migration to populate organizations from existing projects should be done separately
-- This migration only handles schema changes
