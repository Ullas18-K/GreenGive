

# GreenGive — Subscription Golf Platform with Charity & Prize Draws

## Overview
A premium, emotion-driven platform where golfers subscribe, track scores, enter monthly prize draws, and contribute to charities. Design language: modern charity platform (Patreon meets Charity:Water), not a traditional golf site.

## Brand & Design System
- **Primary:** Deep forest green `#1a3a2a`, Off-white `#f8f6f0`, Gold CTAs `#c9a84c`, Coral charity highlights `#e8705a`
- **Typography:** Plus Jakarta Sans — clean, modern
- **Motion:** Framer Motion for page transitions, card hovers, hero animations
- **Mobile-first, fully responsive**

---

## Phase 1: Database Schema & Auth

### Supabase Tables
- `charities` — name, description, image_url, cause_type, upcoming_events (jsonb), total_contributions
- `user_roles` — user_id, role (enum: admin, user)
- `scores` — user_id, score_value (1–45), score_date (max 5 per user)
- `draws` — draw_date, draw_numbers (int array), draw_type, jackpot_amount, published
- `draw_entries` — draw_id, user_id, user_scores (int array)
- `winners` — draw_id, user_id, match_type, prize_amount, proof_url, verified, paid
- `subscriptions` — user_id, plan, amount, stripe_subscription_id, status, renewal_date
- RLS policies on all tables; `has_role()` security definer function for admin checks

### Auth
- Supabase Auth with email/password
- Signup collects: name, email, password, charity selection, plan choice
- Profile data stored via trigger on signup
- Admin role managed in `user_roles` table

---

## Phase 2: Public Homepage

### Hero Section
- Tagline: **"Win. Give. Play."**
- Animated gradient/particle background (Framer Motion)
- Subtitle explaining the concept + prominent "Subscribe Now" CTA (gold)

### How It Works Section
- 3-step animated cards: Subscribe → Enter Scores → Win & Give
- Clean icons, staggered fade-in animations

### Prize Draw Explainer
- Visual 3-tier breakdown: 5-match (40%), 4-match (35%), 3-match (25%)
- Lottery-ball style number circles
- Jackpot rollover callout

### Featured Charity Spotlight
- Hero image, description, coral accent highlights
- Upcoming golf day event preview
- Contribution stats

### Pricing Section
- Monthly (£9.99) / Yearly (£99.99) toggle
- "Save 17%" badge on yearly
- PricingCard components with gold CTA buttons

### Sticky Header
- Logo + navigation + Subscribe CTA button

---

## Phase 3: Auth Pages
- `/signup` — multi-field form with charity dropdown, plan selector
- `/login` — simple email/password
- Redirect to `/dashboard` on success
- Clean, minimal forms matching brand design

---

## Phase 4: User Dashboard (`/dashboard`)

### Subscription Status Card
- Active/Inactive/Lapsed badge with color coding
- Renewal date, plan type

### Score Entry Widget
- Input for Stableford score (1–45) with date picker
- Rolling list of last 5 scores (newest first)
- Auto-removes oldest when 6th added
- Toast on successful entry

### Charity Card
- Selected charity display
- Contribution slider (10%–50%)
- Change charity option

### Draw Participation
- Draws entered count, next draw date
- Current scores as entry preview

### Winnings Overview
- Total won, payment status (Pending/Paid)
- "Claim Prize" button with proof upload for winners

---

## Phase 5: Charity Pages

### `/charities` — Directory
- Grid of CharityCards: name, image, cause tag, contribution progress bar
- Search bar + cause type filter

### `/charities/:id` — Profile
- Hero image, full description
- Upcoming golf day events
- Total platform contributions stat
- Independent "Donate" button

---

## Phase 6: Draw Results (`/draws`)
- Reverse chronological list of monthly draws
- DrawResultCard: date, winning numbers (lottery-ball circles), winner tiers
- Jackpot rollover display when no 5-match winner

---

## Phase 7: Admin Panel (`/admin`)

Protected by admin role check.

### Users Tab
- DataTable: all users, subscription status, scores, charity
- Edit scores capability

### Draw Management Tab
- Random vs Algorithmic toggle (with frequency weighting config)
- "Run Simulation" — preview results without publishing
- SimulationResultsPanel showing match counts and prize splits
- "Publish Results" button

### Charities Tab
- CRUD for charities: name, description, image upload, events

### Winners Tab
- Winner list with proof review
- Approve/Reject verification buttons
- Mark as Paid toggle

### Analytics Tab
- Cards: active subscribers, total prize pool, charity contributions, draw stats

---

## Phase 8: Stripe Integration
- Enable Lovable Stripe integration
- Monthly (£9.99) and Yearly (£99.99) subscription products
- Webhook handling for payment events
- Non-subscribers see blurred/locked dashboard with upgrade CTA

---

## Key Components
1. PricingCard (plan toggle + CTA)
2. ScoreEntry (input + date picker + rolling list)
3. DrawExplainer (animated tier breakdown)
4. CharityCard (grid card with progress bar)
5. DrawResultCard (lottery-ball numbers)
6. AdminDataTable (sortable with actions)
7. SubscriptionStatusBadge (color-coded)
8. CharitySlider (contribution % selector)
9. WinnerVerificationCard (upload + approve/reject)
10. SimulationResultsPanel

