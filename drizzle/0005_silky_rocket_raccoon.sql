ALTER TABLE "library" ALTER COLUMN "book_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "library" ADD COLUMN "story_id" integer;