-- Add the new array column (default empty)
ALTER TABLE "Event" ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: carry each existing single category into the new array
UPDATE "Event" SET "categories" = ARRAY["category"] WHERE "category" IS NOT NULL;

-- Drop the old column
ALTER TABLE "Event" DROP COLUMN "category";