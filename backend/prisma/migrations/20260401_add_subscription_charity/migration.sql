ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "charity_id" text,
  ADD COLUMN IF NOT EXISTS "charity_name" text,
  ADD COLUMN IF NOT EXISTS "charity_percent" smallint DEFAULT 10;

UPDATE "subscriptions"
SET "charity_percent" = 10
WHERE "charity_percent" IS NULL;
