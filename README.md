# GreenGive

GreenGive is a charity-focused web app centered on subscription tiers and draw-style campaigns that support green and community causes.

## Repository layout

- frontend: React + Vite + TypeScript app
- backend: Express + Prisma + Stripe API service

## Frontend setup

The frontend uses a single environment variable for the API base URL.

Create a local env file:

```bash
cp frontend/.env.example frontend/.env
```

Then update `VITE_API_BASE_URL` for your environment.

### Commands

```bash
npm install --prefix frontend
npm run dev
```

## Backend setup

```bash
npm install --prefix backend
npm run dev --prefix backend
```

## Hosting

See HOSTING.md for production deployment steps (Vercel + backend hosting + Supabase).
