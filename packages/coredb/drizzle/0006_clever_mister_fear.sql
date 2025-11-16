ALTER TABLE "apikey" DROP CONSTRAINT "apikey_organization_id_org_id_fk";
--> statement-breakpoint
ALTER TABLE "apikey" DROP COLUMN "organization_id";