CREATE TABLE "key_points" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"file_storage_id" varchar(191),
	"keypoints" text NOT NULL,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "key_points" ADD CONSTRAINT "key_points_file_storage_id_file_storage_id_fk" FOREIGN KEY ("file_storage_id") REFERENCES "public"."file_storage"("id") ON DELETE no action ON UPDATE no action;