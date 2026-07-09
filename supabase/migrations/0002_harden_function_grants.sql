-- Hardening pass (from Supabase security advisors, applied 2026-07-09):
-- 1. handle_new_user is trigger-only — nobody may call it via the REST RPC API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- 2. spend_credits: only spendable for YOURSELF. The service role (auth.uid()
--    is null) bypasses for server-side jobs. Prevents a signed-in user from
--    draining another user's balance by calling the RPC with a foreign UUID.
create or replace function public.spend_credits(p_user_id uuid, p_amount int, p_reason text)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  balance int;
begin
  if auth.uid() is not null and p_user_id is distinct from auth.uid() then
    raise exception 'forbidden';
  end if;

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

revoke all on function public.spend_credits(uuid, int, text) from public, anon;
grant execute on function public.spend_credits(uuid, int, text) to authenticated, service_role;
