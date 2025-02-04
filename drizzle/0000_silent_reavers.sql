CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
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
	"embedding" vector(384),
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
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"password" text,
	"emailVerified" timestamp,
	"image" text,
	"role" "role" DEFAULT 'USER',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_file_storage_id_file_storage_id_fk" FOREIGN KEY ("file_storage_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_file_storage_id_file_storage_id_fk" FOREIGN KEY ("file_storage_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_users_id_user_id_fk" FOREIGN KEY ("users_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "documents" USING hnsw ("embedding" vector_cosine_ops);