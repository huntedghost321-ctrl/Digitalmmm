import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";

// GDPR Art. 20 / NDPA data portability: one-click export of everything we hold
// on the user, as JSON (MVP item 12).
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  const [profile, products, notifications, credits, referrals, subscriptions, exportsRows] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("products").select("*, product_versions(*), compliance_checks(*)"),
      supabase.from("notifications").select("*"),
      supabase.from("credit_ledger").select("*"),
      supabase.from("referrals").select("*"),
      supabase.from("subscriptions").select("*"),
      supabase.from("exports").select("*"),
    ]);

  await supabase.from("data_requests").insert({ user_id: user.id, kind: "export", status: "completed" });

  const payload = {
    exportedAt: new Date().toISOString(),
    account: profile.data,
    products: products.data ?? [],
    exports: exportsRows.data ?? [],
    notifications: notifications.data ?? [],
    creditLedger: credits.data ?? [],
    referrals: referrals.data ?? [],
    subscriptions: subscriptions.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="digitalmmm-data-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
