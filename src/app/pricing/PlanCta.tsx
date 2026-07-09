"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanTier } from "@/lib/plans";

// Upgrade CTA with the EU Consumer Rights Directive consent step (MVP item 15):
// checkout only proceeds after explicit consent to immediate access.
export function PlanCta({ tier }: { tier: PlanTier }) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (tier === "free") {
    return (
      <button
        onClick={() => router.push("/signup")}
        className="w-full rounded border border-ink/20 px-4 py-2.5 text-sm font-medium hover:bg-ink/5"
      >
        Start free
      </button>
    );
  }

  const checkout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, withdrawalConsent: consent }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/signup?plan=${tier}`);
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!showConsent) {
    return (
      <button
        onClick={() => setShowConsent(true)}
        className="w-full rounded bg-teal px-4 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark"
      >
        Choose {tier === "starter" ? "Starter" : tier === "pro" ? "Pro" : "Studio"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2 text-left text-xs text-ink/75">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-teal"
        />
        <span>
          I agree to immediate access to my subscription and understand this waives
          my EU 14-day right of withdrawal.
        </span>
      </label>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <button
        onClick={checkout}
        disabled={!consent || busy}
        className="w-full rounded bg-teal px-4 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Opening checkout…" : "Continue to checkout"}
      </button>
    </div>
  );
}
