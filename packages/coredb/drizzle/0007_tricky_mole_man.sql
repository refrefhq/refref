-- Migrate existing program template IDs from database IDs to constant IDs
UPDATE "program" SET "program_template_id" = 'standard' WHERE "program_template_id" = 'pgt_yic2ws4jnnoo4dbps3017lda';--> statement-breakpoint
UPDATE "program" SET "program_template_id" = 'single-sided' WHERE "program_template_id" = 'pgt_k8m2vx9zp1rtn4wq7ejs6blh';--> statement-breakpoint
UPDATE "program" SET "program_template_id" = 'affiliate' WHERE "program_template_id" = 'pgt_n5q8rx3tp2ywl9km1vhd4ucg';--> statement-breakpoint

-- Drop foreign key constraint and program_template table
ALTER TABLE "program" DROP CONSTRAINT "program_program_template_id_program_template_id_fk";--> statement-breakpoint
ALTER TABLE "program_template" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "program_template" CASCADE;
