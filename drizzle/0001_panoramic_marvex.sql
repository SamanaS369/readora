CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moderation_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moderation_reason" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moderation_score" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "reviewed_at" timestamp;