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
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "file_storage" DROP CONSTRAINT "file_storage_users_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "embedding" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_storage" ADD CONSTRAINT "file_storage_users_id_user_id_fk" FOREIGN KEY ("users_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;