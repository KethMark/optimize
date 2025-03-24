ALTER TABLE "conversations" RENAME COLUMN "parts" TO "content";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "role";