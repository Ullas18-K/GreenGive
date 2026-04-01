CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('admin', 'user');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" uuid PRIMARY KEY,
  "role" "Role" NOT NULL DEFAULT 'user',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "user_id" uuid PRIMARY KEY,
  "plan" text NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "stripe_subscription_id" text,
  "status" text NOT NULL,
  "renewal_date" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "charities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "image_url" text,
  "cause_type" text,
  "upcoming_events" jsonb,
  "total_contributions" numeric(12, 2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "score_value" int NOT NULL,
  "score_date" date NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "scores_user_id_idx" ON "scores" ("user_id");

CREATE TABLE IF NOT EXISTS "draws" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "draw_date" date NOT NULL,
  "draw_numbers" int[] NOT NULL,
  "draw_type" text NOT NULL,
  "jackpot_amount" numeric(12, 2) NOT NULL,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "draw_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "draw_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "user_scores" int[] NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "draw_entries_draw_id_idx" ON "draw_entries" ("draw_id");
CREATE INDEX IF NOT EXISTS "draw_entries_user_id_idx" ON "draw_entries" ("user_id");

CREATE TABLE IF NOT EXISTS "winners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "draw_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "match_type" text NOT NULL,
  "prize_amount" numeric(12, 2) NOT NULL,
  "proof_url" text,
  "verified" boolean NOT NULL DEFAULT false,
  "paid" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "winners_draw_id_idx" ON "winners" ("draw_id");
CREATE INDEX IF NOT EXISTS "winners_user_id_idx" ON "winners" ("user_id");
