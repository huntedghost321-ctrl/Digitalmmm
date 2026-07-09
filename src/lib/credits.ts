import type { SupabaseClient } from "@supabase/supabase-js";
import { CREDIT_COSTS, type CreditAction } from "./plans";

export async function getBalance(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("delta")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.delta, 0);
}

// Spend via the atomic security-definer function — the balance check and the
// debit happen in one transaction server-side, so the client can never race
// its way into negative credits.
export async function spendCredits(
  supabase: SupabaseClient,
  userId: string,
  action: CreditAction
): Promise<{ ok: true; remaining: number } | { ok: false; error: "insufficient_credits" }> {
  const cost = CREDIT_COSTS[action];
  const { data, error } = await supabase.rpc("spend_credits", {
    p_user_id: userId,
    p_amount: cost,
    p_reason: action,
  });
  if (error) {
    if (error.message.includes("insufficient_credits")) {
      return { ok: false, error: "insufficient_credits" };
    }
    throw error;
  }
  return { ok: true, remaining: data as number };
}
