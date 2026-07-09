import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PLANS, CREDIT_COSTS } from "@/lib/plans";
import { PlanCta } from "./PlanCta";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Self-serve on every tier. Visible credits, price-lock guarantee, commercial rights stated per plan.",
};

export default function PricingPage() {
  const plans = [PLANS.free, PLANS.starter, PLANS.pro, PLANS.studio];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-ink/75">
          Every tier is self-serve — no “email us” step, including the top one.
          Prices are locked while you stay subscribed.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`flex flex-col rounded-lg border p-6 ${
                plan.tier === "pro"
                  ? "border-teal bg-white shadow-[0_4px_28px_rgba(31,95,91,0.12)]"
                  : "border-ink/10 bg-white/60"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl font-semibold">{plan.name}</h2>
                {plan.tier === "pro" && (
                  <span className="rounded-full bg-teal px-2.5 py-0.5 font-mono text-[11px] text-paper">
                    Most useful
                  </span>
                )}
              </div>
              <p className="mt-3">
                <span className="font-mono text-3xl font-medium">
                  {plan.priceUsd === 0 ? "$0" : `$${plan.priceUsd}`}
                </span>
                <span className="text-sm text-ink/60">/month</span>
              </p>
              <p className="mt-3 text-sm text-ink/70">{plan.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PlanCta tier={plan.tier} />
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold">What credits buy</h2>
            <p className="mt-2 text-sm text-ink/70">
              Generation costs are visible and capped — never an unlimited black box.
            </p>
            <table className="mt-5 w-full max-w-md text-sm">
              <tbody className="divide-y divide-ink/10">
                {(
                  [
                    ["Ebook", CREDIT_COSTS.ebook],
                    ["Workbook", CREDIT_COSTS.workbook],
                    ["Planner", CREDIT_COSTS.planner],
                    ["Cover", CREDIT_COSTS.cover],
                    ["Compliance check", CREDIT_COSTS.compliance],
                    ["Localization pass", CREDIT_COSTS.localize],
                  ] as const
                ).map(([label, cost]) => (
                  <tr key={label}>
                    <td className="py-2.5">{label}</td>
                    <td className="py-2.5 text-right font-mono">{cost} credits</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-6 text-sm text-ink/75">
            <div>
              <h3 className="font-semibold text-ink">Commercial usage rights</h3>
              <p className="mt-1">
                You own what you generate and can sell it, on every tier. Free-plan
                exports carry a small watermark; paid plans don&apos;t.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Fair use</h3>
              <p className="mt-1">
                Credits cap generation volume per plan. We don&apos;t throttle silently or
                bill overages without asking — see the{" "}
                <a href="/legal/acceptable-use" className="underline decoration-amber underline-offset-2">
                  Acceptable Use Policy
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">EU buyers</h3>
              <p className="mt-1">
                At checkout you&apos;ll be asked to consent to immediate access, which
                waives the EU 14-day withdrawal right. Prefer to keep it? Skip the
                consent and contact support within 14 days for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Payments</h3>
              <p className="mt-1">
                Cards and Google Pay via Stripe Checkout. We never see or store card numbers.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
