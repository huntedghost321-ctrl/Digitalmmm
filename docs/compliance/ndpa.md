# Nigeria Data Protection Act (NDPA) 2023 — day-one checklist

Nigeria is the home base, so NDPA compliance is mandatory from launch — a separate
regime from GDPR, not covered by it. Threshold to watch: **200+ Nigerian data subjects
in any 6-month period** triggers the registration/DPO/audit duties below — a low bar,
assume it will be crossed.

Penalties: ₦10,000,000 or 2% of annual revenue, whichever is greater.

## Operational checklist (non-code actions the founder must complete)

- [ ] **Register with the NDPC** as a data controller (ndpc.gov.ng portal).
- [ ] **Appoint a Data Protection Officer** and publish the contact route
      (the Privacy Policy already routes DPO mail to support@digitalmmm.com with
      subject "DPO" — replace with a dedicated address once staffed).
- [ ] **Engage a licensed compliance auditor** for the annual audit; calendar the
      filing deadline.
- [ ] Keep a **record of processing activities** (the schema in
      `supabase/migrations/0001_init.sql` documents exactly what is stored and why).
- [ ] **Watch item:** the National Digital Economy and E-Governance Bill may add
      licensing for "high-risk" AI systems — monitor for Q2/Q3 2026 signing before
      any Nigeria-market AI feature expansion.

## What the codebase already provides

- Data-subject rights: one-click export (`/api/account/export`) and self-serve
  erasure (`/api/account/delete`), with a `data_requests` audit trail.
- Data minimisation: only email + auth provider are collected as personal data.
- Security controls per PRD 9A (RLS, TLS, least-privilege service role).
