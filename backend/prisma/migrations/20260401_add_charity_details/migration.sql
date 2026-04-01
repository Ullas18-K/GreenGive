ALTER TABLE "charities"
  ADD COLUMN IF NOT EXISTS "full_description" text,
  ADD COLUMN IF NOT EXISTS "goal_amount" numeric(12, 2);
