ALTER TABLE "conversations" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "content";