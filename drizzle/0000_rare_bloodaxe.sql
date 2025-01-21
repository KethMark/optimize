CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"file_storage_id" varchar(191),
	"content" json NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"file_storage_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(1024),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_storage" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"users_id" varchar(191),
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_file_storage_id_file_storage_id_fk" FOREIGN KEY ("file_storage_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_file_storage_id_file_storage_id_fk" FOREIGN KEY ("file_storage_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_users_id_users_id_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "documents" USING hnsw ("embedding" vector_cosine_ops);