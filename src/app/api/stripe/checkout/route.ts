import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { getStripe, priceIdFor, stripeConfigured } from "@/lib/stripe";
import type { PlanTier } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  if (!stripeConfigured()) {
    return jsonError(503, "not_configured", "Billing is not configured on this deployment.");
  }

  let body: { tier?: string; withdrawalConsent?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }

  const tier = body.tier as PlanTier;
  const priceId = priceIdFor(tier);
  if (!priceId) return jsonError(400, "bad_request", "Unknown plan tier.");

  // EU Consumer Rights Directive: the buyer must explicitly consent to
  // immediate access and waive the 14-day withdrawal right, or the purchase
  // stays refundable for 14 days regardless of usage (MVP item 15).
  if (body.withdrawalConsent !== true) {
    return jsonError(
      422,
      "withdrawal_consent_required",
      "Please confirm you agree to immediate access and waive your 14-day withdrawal right."
    );
  }

  const stripe = getStripe();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    // "card" covers Google Pay and Apple Pay automatically in Stripe Checkout
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    success_url: `${site}/dashboard?upgraded=1`,
    cancel_url: `${site}/pricing`,
    metadata: {
      user_id: user.id,
      tier,
      withdrawal_consent_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
