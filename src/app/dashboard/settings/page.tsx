import { createClient } from "@/lib/supabase/server";
import { planFor, PLANS } from "@/lib/plans";
import { getBalance } from "@/lib/credits";
import { DangerZone } from "./DangerZone";
import Link from "next/link";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, balance, { data: ledger }] =
    await Promise.all([
      supabase.from("users").select("plan_tier, referral_code, auth_provider, created_at").eq("id", user!.id).single(),
      supabase.from("subscriptions").select("plan, status, current_period_end").eq("user_id", user!.id).maybeSingle(),
      getBalance(supabase, user!.id).catch(() => 0),
      supabase
        .from("credit_ledger")
        .select("delta, reason, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

  const plan = planFor(profile?.plan_tier);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>

      <section className="rounded border border-ink/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-semibold">Account</h2>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Email</dt>
            <dd className="font-mono">{user!.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Sign-in method</dt>
            <dd className="capitalize">{profile?.auth_provider ?? "email"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Member since</dt>
            <dd>{profile ? new Date(profile.created_at).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded border border-ink/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-semibold">Plan &amp; credits</h2>
        <p className="mt-3 text-sm">
          You&apos;re on <strong>{plan.name}</strong>
          {subscription?.status === "active" && subscription.current_period_end && (
            <span className="text-ink/60">
              {" "}
              — renews {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          )}
          . Balance: <span className="font-mono text-teal">{balance} credits</span> of{" "}
          {PLANS[plan.tier].monthlyCredits}/month.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded border border-teal px-4 py-2 text-sm font-medium text-teal hover:bg-teal hover:text-paper"
        >
          Change plan
        </Link>
        <h3 className="mt-6 font-mono text-xs uppercase tracking-widest text-ink/50">
          Recent credit activity
        </h3>
        <ul className="mt-2 divide-y divide-ink/5 text-sm">
          {(ledger ?? []).map((row, i) => (
            <li key={i} className="flex justify-between py-2">
              <span className="text-ink/70">{row.reason.replace(/_/g, " ")}</span>
              <span className={`font-mono ${row.delta > 0 ? "text-teal" : "text-ink/70"}`}>
                {row.delta > 0 ? `+${row.delta}` : row.delta}
              </span>
            </li>
          ))}
          {!ledger?.length && <li className="py-2 text-ink/50">No activity yet.</li>}
        </ul>
      </section>

      <section className="rounded border border-ink/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-semibold">Your data</h2>
        <p className="mt-2 text-sm text-ink/70">
          Under GDPR and the Nigeria Data Protection Act you can export everything we
          hold about you, or delete your account entirely. No lock-in.
        </p>
        <DangerZone />
      </section>

      <section className="rounded border border-ink/10 bg-white/70 p-6 text-sm">
        <h2 className="font-display text-xl font-semibold">Support</h2>
        <p className="mt-2 text-ink/70">
          Email <a href="mailto:support@digitalmmm.com" className="font-mono underline underline-offset-2">support@digitalmmm.com</a>{" "}
          — billing, bugs, data requests. Answers to common questions live in the{" "}
          <Link href="/faq" className="underline decoration-amber underline-offset-2">FAQ</Link>.
        </p>
      </section>
    </div>
  );
}
