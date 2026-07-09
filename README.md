# digitalmmm

An AI studio that turns raw material — a topic, a PDF, a website — into a finished,
sellable digital product. This repository contains the **MVP (Phase 1)** build per the
product requirements document.

## What's in the MVP

| PRD item | Where |
| --- | --- |
| 1. Auth (email/Google/GitHub) + Stripe billing with Google Pay | `src/app/login`, `src/app/signup`, `src/app/api/stripe/*` |
| 2. Create Source: topic, URL, PDF | `src/app/api/ingest`, `src/lib/ingest.ts` |
| 3. Generators: ebook, workbook, planner | `src/lib/generation.ts`, `src/app/api/generate` |
| 4. AI cover maker (vector spec, SVG + PDF render) | `src/lib/cover.ts`, `src/app/api/cover` |
| 5. KDP compliance checker (basic) | `src/lib/compliance.ts`, `src/app/api/compliance` |
| 6. US/UK localization | `src/lib/localize.ts`, `src/app/api/localize` |
| 7. PDF/DOCX export | `src/lib/export/*`, `src/app/api/export` |
| 8. Dashboard library + product workspace | `src/app/dashboard/*` |
| 9. Trustpilot widget + trust section | `src/components/Trustpilot.tsx` |
| 10. Referral system (20% of first payment) | `src/app/dashboard/referrals`, Stripe webhook |
| 11. Notification bell (generation + compliance + billing) | `src/components/NotificationBell.tsx` |
| 12. Legal pages, cookie consent, GDPR export/delete | `src/app/legal/*`, `src/app/api/account/*` |
| 13. Visible credit system | `src/lib/plans.ts`, `credit_ledger` + `spend_credits()` |
| 14. Support email + FAQ | `src/app/faq` |
| 15. EU AI Act Art. 50 marking + 14-day withdrawal consent | `src/lib/marking.ts`, checkout consent step |
| 16. NDPA registration/DPO/audit | `docs/compliance/ndpa.md` (operational checklist) |

Phase 2 / Phase 3 features are intentionally not built yet; the public roadmap on
`/tools` labels every category honestly (live / in development / planned).

## Stack

Next.js 15 (App Router) · Tailwind CSS 4 · Supabase (Postgres + Auth + RLS) ·
Anthropic API (Claude) · Stripe Checkout · pdf-lib + docx for exports · Vercel-ready.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Anthropic, Stripe keys
npm run dev
```

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` (SQL editor or CLI).
2. Enable Email, Google and GitHub providers in Supabase Auth.
3. Create three Stripe recurring prices (Starter/Pro/Studio) and set the price IDs in env.
4. Point a Stripe webhook at `/api/stripe/webhook` (events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`).

The app degrades gracefully: without env keys, marketing pages render and API routes
return clear 503s instead of crashing.

## Security posture (PRD 9A — built in from the first commit)

- RLS on every table; billing/referral rows are written only by the signed Stripe
  webhook via the service role.
- Credits are spent through an atomic `security definer` Postgres function — the
  client can never race a balance negative or self-report entitlements.
- Passwords/OAuth handled entirely by Supabase Auth (bcrypt, official flows).
- Card data never touches this codebase (Stripe Checkout).
- SSRF guard on URL ingestion; magic-byte validation and size caps on PDF upload;
  user prompt material is fenced as reference-only in the LLM system prompt.
- Security headers + CSP in `next.config.mjs`. See `docs/SECURITY.md`.

## Compliance docs

- `docs/compliance/eu-ai-act.md` — Article 50 marking implementation + deadline notes
- `docs/compliance/ndpa.md` — Nigeria DPA registration/DPO/audit checklist (day-one)
- `/legal/*` pages — Terms, Privacy, Refunds, Acceptable Use, AI Disclosure
