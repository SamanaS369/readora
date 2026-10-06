ALTER TABLE "reading_progress" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD COLUMN "story_id" integer;