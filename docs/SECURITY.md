# Security overview (PRD Section 9A)

Defense-in-depth, built in from the first commit. No system is unhackable; the goal is
independent layers so one failure doesn't cascade.

## Authentication & access
- Supabase Auth: bcrypt password hashing, official Google/GitHub OAuth flows (no
  third-party passwords stored), short-lived JWT sessions in httpOnly/sameSite cookies,
  revocation on password change. Rate limiting on auth endpoints is Supabase-managed.
- 2FA: planned for Phase 2 (mandatory for staff and pre-payout sellers when the
  marketplace ships).

## Data protection
- **RLS on every table** — the core defense against cross-tenant reads. Billing,
  referral and subscription rows are select-only for owners; writes happen exclusively
  through the signed Stripe webhook using the service role.
- TLS 1.3 in transit; Supabase encryption at rest.
- Secrets live in environment variables only; `SUPABASE_SERVICE_ROLE_KEY` is used in
  exactly two server-only modules (webhook, GDPR delete) and never bundled client-side.
- Data minimisation + GDPR/NDPA export & erasure endpoints.

## Application hardening
- All DB access via Supabase's parameterized client — no string-built SQL anywhere.
- CSP, X-Frame-Options DENY, nosniff, referrer and permissions policies in
  `next.config.mjs`; React's default output encoding guards XSS (`dangerouslySetInnerHTML`
  is used only for cover SVGs rendered from our own server-generated spec, never user HTML).
- CSRF: state-changing routes require the Supabase auth cookie and JSON bodies; Stripe
  webhook requires a valid signature.
- Uploads: PDF magic-byte check, 20 MB cap, text-extraction only (no file persisted or
  served back). URL ingestion has an SSRF guard (scheme + private-host blocklist, 15 s
  timeout, content-type allowlist).
- Prompt injection: user source material is delimited and explicitly declared
  reference-only in the system prompt; user input never reaches system instructions or
  secrets.

## Payments & financial integrity
- Stripe Checkout only — raw card data never touches this codebase (PCI stays with
  Stripe).
- All entitlement changes verified via signed webhooks, not client callbacks.
- Credits are debited by an atomic `security definer` Postgres function with an
  advisory lock — concurrent requests cannot overdraw.

## Operations (pre-launch checklist)
- [ ] Enable Dependabot / `npm audit` in CI and set a patch cadence.
- [ ] Cloudflare (or equivalent) WAF + DDoS in front of production.
- [ ] Verify Supabase PITR backups and document the recovery runbook.
- [ ] Third-party penetration test before public launch.
- [ ] Publish a security.txt / responsible-disclosure contact (security@digitalmmm.com).
- [ ] Audit logging review: admin actions and payouts once the marketplace ships.

Report vulnerabilities: security@digitalmmm.com.
