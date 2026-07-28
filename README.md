# Discover Your Type — Personality Inventory

A free-to-take personality test (60 questions, ~3 min) that returns a 4-letter
type (e.g. INTJ, ENFP) plus a paywalled deep-dive profile. Built with Next.js 16,
Tailwind v4, and Stripe.

**Demo it:**
```
npm run dev
# open http://localhost:3000
```

## What it does

1. **Landing** — hero section, stats, then the test starts inline.
2. **Test** — 60 Likert-scale questions (1–5), shown in batches with a progress
   bar and smooth scroll. One answer is picked per question; a "Continue" /
   "Get my type" button advances.
3. **Scoring (server-side)** — each answer is mapped to one of four dimensions
   (E/I, S/N, T/F, J/P), summed per pole, then normalized to 0–100% (poles sum
   to 100). The four dominant poles form the 4-letter type. A consistency gate
   catches straight-lining or random answers.
4. **Results (free tier)** — big type card, tagline (e.g. "The Architect"), a
   one-line summary, and four dimension dials.
5. **Paywall → Premium report** — for a full profile (strengths, growth areas,
   work/relationship style, stress handling, compatible types) the user pays
   $12 via Stripe Checkout, or uses the "demo-unlock" button.

## Data / scoring

- `lib/questions.ts` — 60-item inventory (15 items × 4 dimensions, with
  reverse-worded items per dimension).
- `lib/scoring.ts` — server-side `score(answers)`: pole normalization, 4-letter
  type, consistency check, per-question contribution.
- `lib/profiles.ts` — type-specific report copy generated from each letter.

## Backend routes

- `POST /api/session` — submit answers → returns `id`, `type`, `dimensions`,
  `consistency`. Stores the result and sets a `test_session_id` cookie.
- `GET /api/session?id=...` — retrieve a stored result.
- `POST /api/purchase` — create a Stripe Checkout session ($12).
- `PUT /api/purchase` — direct "unlock" (used by the demo-unlock flow and
  Stripe webhook).
- `GET /api/purchase/status?session=...` — is the report unlocked?

## Payment setup (Stripe)

1. Copy `.env.example` → `.env`.
2. Add your Stripe test keys:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   (once you set up a webhook)
   NEXT_PUBLIC_BASE_URL=https://your-site.example
   ```
3. In your Stripe Dashboard → Products, no setup needed here (the report is
   created as a `price_data` on the fly at $12.00).
4. Add a webhook endpoint for `checkout.session.completed` pointing at
   `/api/purchase` (Stripe CLI:
   `stripe listen --forward-to localhost:3000/api/purchase`).
5. **Without a Stripe key** the paywall's "demo-unlock" button lets you skip
   payment for testing — the full report unlocks immediately.

## Storage

Results are stored as JSON files in `~/.hermes/personality-test/.store` (set by
`STORE_DIR` in the route). **For production**, replace this with a real DB
(Supabase / Postgres) — the scoring logic and API shape are DB-agnostic.

## Deployment

1. Push to Vercel / your host.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`
   as env vars.
3. Swap the file store for a DB.
4. Point the Stripe webhook at your live `/api/purchase`.

## Notes

- This is a personality **inventory for self-reflection**, not a clinical
  assessment. The site states this on the landing page and in the footer.
- "MBTI" is a registered trademark. This project uses 4-letter type shorthand
  (INTJ, ENFP …) but is **not** the MBTI instrument — call it what it is
  ("personality profile / 16 types") rather than "MBTI."
