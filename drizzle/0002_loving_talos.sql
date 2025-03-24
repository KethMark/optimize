ALTER TABLE "conversations" RENAME COLUMN "content" TO "parts";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "role" varchar NOT NULL;