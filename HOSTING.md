# GreenGive hosting guide

This guide deploys:
- Frontend on Vercel
- Backend API on Render (or any Node host)
- Supabase for database + auth
- Stripe for subscriptions
- Brevo SMTP for email

## 1) Create new accounts (ok to reuse GitHub)

- You can create a new Vercel account and still connect the same GitHub repo.
- Supabase can be a new project (recommended for production).

## 2) Supabase production project

1. Create a new Supabase project.
2. Copy database connection string:
   - Project Settings -> Database -> Connection string
3. Run Prisma migrations and seed (from your local machine):
   - npm install --prefix backend
   - npm run prisma:generate --prefix backend
   - npm run prisma:migrate --prefix backend
   - npm run prisma:seed --prefix backend
4. Enable Email/Password auth in Supabase Auth.

## 3) Backend deployment (Render)

1. Create a new Render Web Service.
2. Connect the GitHub repo and choose the root.
3. Build command:
   - npm install --prefix backend && npm run --prefix backend prisma:generate && npm run --prefix backend prisma:migrate && npm run --prefix backend build
4. Start command:
   - npm run --prefix backend start
5. Add environment variables (Settings -> Environment):
   - PORT=3000
   - FRONTEND_URL=https://your-frontend.vercel.app
   - ADMIN_API_KEY=your_long_random_string
   - SUPABASE_URL=https://your-project.supabase.co
   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   - STRIPE_SECRET_KEY=sk_live_...
   - STRIPE_WEBHOOK_SECRET=whsec_...
   - STRIPE_PRICE_MONTHLY=price_...
   - STRIPE_PRICE_YEARLY=price_...
   - DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
   - NOTIFICATIONS_ENABLED=true
   - SMTP_HOST=smtp-relay.brevo.com
   - SMTP_PORT=587
   - SMTP_USER=your_brevo_login
   - SMTP_PASS=your_brevo_smtp_key
   - SMTP_SECURE=false
   - EMAIL_FROM=GreenGive <your-verified-email@example.com>
   - EMAIL_REPLY_TO=your-verified-email@example.com
   - EMAIL_ADMIN=your-verified-email@example.com

Note: If you use Vercel preview URLs, add them to FRONTEND_URL as a comma-separated list.

## 4) Stripe webhook (production)

1. Stripe Dashboard -> Developers -> Webhooks -> Add endpoint.
2. Endpoint URL:
   - https://your-backend.onrender.com/api/billing/webhook
3. Select events:
   - checkout.session.completed
   - invoice.payment_succeeded
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy the signing secret (whsec_...) and set STRIPE_WEBHOOK_SECRET.

## 5) Frontend deployment (Vercel)

1. Create a new Vercel project and connect the repo.
2. Set the root directory to frontend.
3. Build command:
   - npm install && npm run build
4. Output directory:
   - dist
5. Add environment variables:
   - VITE_API_BASE_URL=https://your-backend.onrender.com/api
   - VITE_SUPABASE_URL=https://your-project.supabase.co
   - VITE_SUPABASE_ANON_KEY=your-anon-key

## 6) Supabase auth redirect URL

1. Supabase -> Authentication -> URL Configuration.
2. Add your Vercel domain(s) to Redirect URLs.

## 7) Final checks

1. Visit your Vercel URL and sign up.
2. Complete Stripe checkout.
3. Confirm subscription status updates (Supabase subscriptions table).
4. Test admin panel with an admin user role.
5. Test winner proof upload and admin verification.

## 8) Optional production hardening

- Disable BYPASS_SUBSCRIPTION in all environments.
- Use production Stripe keys only.
- Use a custom domain for Vercel and Render if needed.
- Rotate ADMIN_API_KEY and SMTP credentials periodically.
