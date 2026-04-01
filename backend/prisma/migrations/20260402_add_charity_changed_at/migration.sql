alter table public.subscriptions
  add column if not exists charity_changed_at timestamptz;
