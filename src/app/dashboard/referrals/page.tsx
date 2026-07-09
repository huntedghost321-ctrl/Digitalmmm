import { createClient } from "@/lib/supabase/server";
import { CopyReferralLink } from "./CopyLink";

export const metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: referrals }] = await Promise.all([
    supabase.from("users").select("referral_code").eq("id", user!.id).single(),
    supabase
      .from("referrals")
      .select("amount, commission_status, created_at, paid_at")
      .order("created_at", { ascending: false }),
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digitalmmm.com";
  const link = `${site}/signup?ref=${profile?.referral_code ?? ""}`;
  const total = (referrals ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Referrals</h1>
        <p className="mt-3 text-sm text-ink/70">
          Share your link. When someone you refer makes their first payment, you earn a
          flat <strong>20% of that first payment</strong> — a one-time commission per
          referral, not recurring.
        </p>
      </div>

      <CopyReferralLink link={link} />

      <section className="rounded border border-ink/10 bg-white/70 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Commissions</h2>
          <p className="font-mono text-sm text-teal">${total.toFixed(2)} earned</p>
        </div>
        <ul className="mt-4 divide-y divide-ink/5 text-sm">
          {(referrals ?? []).map((r, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <span className="text-ink/70">
                {new Date(r.created_at).toLocaleDateString()} — referred signup upgraded
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono">${Number(r.amount).toFixed(2)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                    r.commission_status === "paid"
                      ? "bg-teal text-paper"
                      : "bg-amber/20 text-ink"
                  }`}
                >
                  {r.commission_status}
                </span>
              </span>
            </li>
          ))}
          {!referrals?.length && (
            <li className="py-3 text-ink/50">No commissions yet — share your link to start.</li>
          )}
        </ul>
        <p className="mt-4 text-xs text-ink/50">
          Approved commissions are paid out monthly. Questions? support@digitalmmm.com
        </p>
      </section>
    </div>
  );
}
