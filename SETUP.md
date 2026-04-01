# GreenGive setup checklist

## 1) Supabase project

1. Create a Supabase project and enable Email/Password auth.
2. Grab the Postgres connection string:
   - Supabase dashboard → Project Settings → Database → Connection string
3. Use Prisma migrations to create tables (no manual table creation needed):
   - `npm install --prefix backend`
   - `npm run prisma:generate --prefix backend`
   - `npm run prisma:migrate --prefix backend`
   - `npm run prisma:seed --prefix backend` (loads starter charities + events)
   - Re-run `npm run prisma:migrate --prefix backend` after pulling updates to apply new migrations (ex: charity change limit).
4. Add basic RLS policies (recommended):
   - user_roles: allow users to select their own role
   - subscriptions: allow users to select their own subscription
   - admins can read/write all (via role checks)
5. Add dashboard RLS policies so per-user data loads correctly:

```sql
alter table public.scores enable row level security;
create policy "scores_read_own" on public.scores
for select to authenticated using (user_id = auth.uid());
create policy "scores_insert_own" on public.scores
for insert to authenticated with check (user_id = auth.uid());

alter table public.draw_entries enable row level security;
create policy "draw_entries_read_own" on public.draw_entries
for select to authenticated using (user_id = auth.uid());

alter table public.winners enable row level security;
create policy "winners_read_own" on public.winners
for select to authenticated using (user_id = auth.uid());

alter table public.draws enable row level security;
create policy "draws_read_published" on public.draws
for select to authenticated using (published = true);
```

## 2) Stripe setup (test mode)

### A) Create products + prices

1. Go to Stripe Dashboard (Test mode) -> Products -> Add product.
2. Create Product 1 (Monthly):
   - Name: GreenGive Monthly
   - Pricing model: Recurring
   - Price: GBP 9.99
   - Billing period: Monthly
3. Create Product 2 (Yearly):
   - Name: GreenGive Yearly
   - Pricing model: Recurring
   - Price: GBP 99.99
   - Billing period: Yearly
4. Copy both Price IDs (looks like price_123...).

### B) Get API keys

1. Go to Developers -> API keys.
2. Copy the Secret key (sk_test_...) for STRIPE_SECRET_KEY.
3. Copy the Publishable key (pk_test_...) if needed for client-side usage.

### C) Create webhook

Option 1 (recommended during local dev): Stripe CLI

1. Install Stripe CLI and login:
   - stripe login
2. In a new terminal, start forwarding:
   - stripe listen --forward-to http://localhost:3000/api/billing/webhook
3. Copy the webhook signing secret (whsec_...) into STRIPE_WEBHOOK_SECRET.

Option 2 (Dashboard webhook using ngrok)

1. Start your backend locally:
   - npm run dev:server
2. In a new terminal, start ngrok:
   - ngrok http 3000
3. Copy the HTTPS forwarding URL (example):
   - https://abcd-1234.ngrok-free.app
4. In Stripe Dashboard -> Developers -> Webhooks -> Add endpoint.
5. Endpoint URL (use your ngrok URL):
   - https://abcd-1234.ngrok-free.app/api/billing/webhook
6. Select events:
   - checkout.session.completed
   - invoice.payment_succeeded
   - customer.subscription.updated
   - customer.subscription.deleted
7. Save and copy the signing secret (whsec_...).

### D) Add env vars

Set these in backend/.env:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MONTHLY
- STRIPE_PRICE_YEARLY

## 3) Environment files

### frontend/.env
```
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Local dev override:
- Set VITE_API_BASE_URL to http://localhost:3000/api when running the API locally.

### backend/.env
```
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_API_KEY=replace_with_long_random_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Notifications (SMTP - Brevo)
NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login
SMTP_PASS=your_brevo_smtp_key
SMTP_SECURE=false
EMAIL_FROM=GreenGive <no-reply@your-domain.com>
EMAIL_REPLY_TO=support@your-domain.com
EMAIL_ADMIN=admin@your-domain.com
```

Local dev override:
- Set FRONTEND_URL to http://localhost:5173 when running the frontend locally.

## 4) Install and run

```
npm install --prefix backend
npm install --prefix frontend
```

Start the API:
```
npm run dev:server
```

Start the frontend:
```
npm run dev
```

## 5) Test the signup + subscription flow (local)

1. Start backend and frontend (see section 4).
2. Open the frontend in the browser (default: http://localhost:5173).
3. Go to /signup and fill in name, email, password, charity, and plan.
4. Submit the form. You should be redirected to Stripe Checkout.
5. Use a Stripe test card to complete payment:
   - Card number: 4242 4242 4242 4242
   - Expiry: any future date
   - CVC: any 3 digits
   - ZIP: any 5 digits
6. After successful payment, Stripe redirects you back to /dashboard.
7. Verify subscription status:
   - In Supabase: subscriptions table should show status = active.
   - In the app: dashboard should be accessible without lock screen.

## 6) Test the cancel / unpaid flow (local)

1. Start the same signup flow but cancel on Stripe Checkout.
2. You should return to /signup with checkout=cancel in the URL.
3. Log in using the same email/password.
4. Try to access /dashboard.
5. You should see the Subscription Locked screen with a "Complete checkout" button.

## 7) If Stripe webhook events do not update the subscription

1. Confirm webhook is receiving events (Stripe Dashboard -> Developers -> Webhooks).
2. Confirm backend logs show webhook events being processed.
3. Confirm STRIPE_WEBHOOK_SECRET matches the webhook signing secret.
4. If using ngrok, confirm the endpoint URL is HTTPS and matches your current ngrok URL.

## 8) Winner proof photo uploads (Supabase Storage)

1. Supabase Dashboard -> Storage -> Create bucket.
2. Bucket name: `winner_proofs`.
3. Set the bucket to Public.
4. In SQL Editor, run this policy to allow authenticated uploads:

```sql
create policy "winner_proofs_insert_own"
on storage.objects
for insert
to authenticated
with check (
   bucket_id = 'winner_proofs'
   and owner = auth.uid()
);
```

Optional: if you keep the bucket private, add read policy for authenticated users:

```sql
create policy "winner_proofs_read_auth"
on storage.objects
for select
to authenticated
using (bucket_id = 'winner_proofs');
```

## 9) Production notes

- Use production Stripe keys and webhook secret.
- Host the backend and set `VITE_API_BASE_URL` to its public URL.
- Set `FRONTEND_URL` to your Vercel production domain (comma-separate preview domains if needed).
- Keep BYPASS_SUBSCRIPTION=false in production.

See HOSTING.md for full production deployment steps.

## 10) Notifications (email)

This project uses Brevo SMTP for email notifications (welcome, subscription active, winner alerts).

1. Create a Brevo account and verify your sender email/domain.
2. In Brevo, create an SMTP key (Settings -> SMTP & API).
3. Add the following env vars in backend/.env:
   - SMTP_HOST (use smtp-relay.brevo.com)
   - SMTP_PORT (587)
   - SMTP_USER (your Brevo login)
   - SMTP_PASS (your SMTP key)
   - SMTP_SECURE=false
   - EMAIL_FROM (must match a verified sender)
   - EMAIL_REPLY_TO (optional)
   - EMAIL_ADMIN (optional admin alerts)
4. Set NOTIFICATIONS_ENABLED=true. Set to false to disable all emails.
