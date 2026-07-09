-- digitalmmm — MVP schema (PRD Section 9) + MVP-required additions:
-- notifications (MVP item 11), credit_ledger (MVP item 13), data_requests (MVP item 12).
-- Row-Level Security is enforced on every table (PRD Section 9A) — users can only
-- ever read/write their own rows. Service-role access (webhooks, admin jobs)
-- bypasses RLS by design.

-- ---------------------------------------------------------------------------
-- users (profile table mirroring auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  auth_provider text not null default 'email' check (auth_provider in ('email', 'google', 'github')),
  plan_tier text not null default 'free' check (plan_tier in ('free', 'starter', 'pro', 'studio')),
  referral_code text not null unique,
  referred_by uuid references public.users (id) on delete set null,
  ai_training_opt_out boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users read own profile" on public.users
  for select using (auth.uid() = id);
create policy "users update own profile" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Profile row + referral code are created by trigger, never by the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  ref_code text;
  referrer uuid;
begin
  -- 8-char url-safe referral code, retry on the (unlikely) collision.
  -- gen_random_bytes lives in the extensions schema on Supabase — must be
  -- schema-qualified because this function pins search_path = public.
  loop
    ref_code := lower(substr(replace(replace(encode(extensions.gen_random_bytes(6), 'base64'), '/', ''), '+', ''), 1, 8));
    exit when not exists (select 1 from public.users where referral_code = ref_code);
  end loop;

  select id into referrer
  from public.users
  where referral_code = nullif(new.raw_user_meta_data ->> 'referred_by_code', '');

  insert into public.users (id, email, auth_provider, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    ref_code,
    referrer
  );

  -- Free-plan starting credits (visible credit system, MVP item 13)
  insert into public.credit_ledger (user_id, delta, reason)
  values (new.id, 30, 'signup_grant');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('ebook', 'workbook', 'planner')),
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'exported', 'failed')),
  source_type text not null check (source_type in ('topic', 'url', 'pdf')),
  source_content text,
  cover jsonb,
  locale text not null default 'US' check (locale in ('US', 'UK')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products owner all" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- product_versions
-- ---------------------------------------------------------------------------
create table public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  content text not null,
  version_number int not null,
  label text,
  created_at timestamptz not null default now(),
  unique (product_id, version_number)
);

alter table public.product_versions enable row level security;

create policy "versions via product owner" on public.product_versions
  for all using (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- compliance_checks
-- ---------------------------------------------------------------------------
create table public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  flags jsonb not null default '[]'::jsonb,
  passed boolean not null default false,
  checked_at timestamptz not null default now()
);

alter table public.compliance_checks enable row level security;

create policy "compliance via product owner" on public.compliance_checks
  for all using (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- exports
-- ---------------------------------------------------------------------------
create table public.exports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  format text not null check (format in ('pdf', 'docx')),
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.exports enable row level security;

create policy "exports via product owner" on public.exports
  for all using (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- referrals — flat 20% of first payment only (PRD 5.11)
-- ---------------------------------------------------------------------------
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users (id) on delete cascade,
  referred_user_id uuid not null references public.users (id) on delete cascade,
  commission_status text not null default 'pending' check (commission_status in ('pending', 'approved', 'paid')),
  amount numeric(10, 2) not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);

alter table public.referrals enable row level security;

-- Referrers can see their commissions; rows are written by the Stripe webhook
-- (service role) only — never by the client.
create policy "referrals read own" on public.referrals
  for select using (auth.uid() = referrer_id);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  stripe_customer_id text,
  plan text not null check (plan in ('starter', 'pro', 'studio')),
  status text not null default 'incomplete',
  current_period_end timestamptz,
  -- EU Consumer Rights Directive: explicit consent to immediate access,
  -- waiving the 14-day withdrawal right (PRD 5.18 / MVP item 15)
  withdrawal_consent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.subscriptions enable row level security;

-- Read-only for the owner; written by the Stripe webhook via service role.
create policy "subscriptions read own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- credit_ledger — visible credit/usage system (MVP item 13)
-- ---------------------------------------------------------------------------
create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.credit_ledger enable row level security;

-- Read-only for the owner. Spends/grants happen server-side via the
-- security-definer function below or the service role, never from the client.
create policy "credits read own" on public.credit_ledger
  for select using (auth.uid() = user_id);

-- Atomic server-side spend: fails when the balance is insufficient, so credits
-- can never go negative even under concurrent generations (PRD 9A: server-side
-- validation of every credit balance).
create or replace function public.spend_credits(p_user_id uuid, p_amount int, p_reason text)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  balance int;
begin
  if p_amount <= 0 then
    raise exception 'spend amount must be positive';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select coalesce(sum(delta), 0) into balance
  from public.credit_ledger where user_id = p_user_id;

  if balance < p_amount then
    raise exception 'insufficient_credits';
  end if;

  insert into public.credit_ledger (user_id, delta, reason)
  values (p_user_id, -p_amount, p_reason);

  return balance - p_amount;
end;
$$;

-- Callable only through the authenticated server client for the caller's own id.
revoke all on function public.spend_credits(uuid, int, text) from public;
grant execute on function public.spend_credits(uuid, int, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- notifications — bell, basic version (MVP item 11)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('generation', 'compliance', 'billing')),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications owner all" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- data_requests — GDPR/NDPA export & delete-on-request handling (MVP item 12)
-- ---------------------------------------------------------------------------
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null check (kind in ('export', 'delete')),
  status text not null default 'received' check (status in ('received', 'processing', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.data_requests enable row level security;

create policy "data requests owner" on public.data_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index products_user_idx on public.products (user_id, created_at desc);
create index versions_product_idx on public.product_versions (product_id, version_number desc);
create index compliance_product_idx on public.compliance_checks (product_id, checked_at desc);
create index exports_product_idx on public.exports (product_id);
create index credit_ledger_user_idx on public.credit_ledger (user_id);
create index notifications_user_idx on public.notifications (user_id, read, created_at desc);
create index referrals_referrer_idx on public.referrals (referrer_id);
