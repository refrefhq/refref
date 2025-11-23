CREATE TABLE "reflink" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"refcode_id" text NOT NULL,
	"product_id" text NOT NULL
);
--> statement-breakpoint
DROP INDEX "refcode_global_code_unique_idx";--> statement-breakpoint
DROP INDEX "refcode_local_code_unique_idx";--> statement-breakpoint
DROP INDEX "refcode_code_idx";--> statement-breakpoint
ALTER TABLE "reflink" ADD CONSTRAINT "reflink_refcode_id_refcode_id_fk" FOREIGN KEY ("refcode_id") REFERENCES "public"."refcode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflink" ADD CONSTRAINT "reflink_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reflink_slug_product_unique_idx" ON "reflink" USING btree ("slug","product_id");--> statement-breakpoint
CREATE INDEX "reflink_slug_idx" ON "reflink" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reflink_refcode_id_idx" ON "reflink" USING btree ("refcode_id");--> statement-breakpoint
CREATE INDEX "reflink_product_id_idx" ON "reflink" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refcode_code_unique_idx" ON "refcode" USING btree ("code");--> statement-breakpoint
CREATE INDEX "refcode_product_id_idx" ON "refcode" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "refcode" DROP COLUMN "global";