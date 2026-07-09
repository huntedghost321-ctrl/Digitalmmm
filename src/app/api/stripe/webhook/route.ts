import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, stripeConfigured, tierForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanTier } from "@/lib/plans";

// All billing state changes flow through this signed webhook — never through
// client-side callbacks a user could forge (PRD 9A).
export async function POST(req: NextRequest) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id ?? session.client_reference_id;
    const tier = session.metadata?.tier as PlanTier | undefined;
    if (!userId || !tier || !PLANS[tier]) return NextResponse.json({ received: true });

    const consentAt = session.metadata?.withdrawal_consent_at ?? new Date().toISOString();

    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        plan: tier,
        status: "active",
        withdrawal_consent_at: consentAt,
      },
      { onConflict: "user_id" }
    );
    await admin.from("users").update({ plan_tier: tier }).eq("id", userId);

    // Plan credits for the first period
    await admin.from("credit_ledger").insert({
      user_id: userId,
      delta: PLANS[tier].monthlyCredits,
      reason: `plan_grant_${tier}`,
    });

    await admin.from("notifications").insert({
      user_id: userId,
      type: "billing",
      message: `Welcome to the ${PLANS[tier].name} plan — ${PLANS[tier].monthlyCredits.toLocaleString()} credits added.`,
    });

    // Referral commission: flat 20% of the FIRST payment only (PRD 5.11).
    // The unique constraint on referred_user_id makes this idempotent.
    const { data: profile } = await admin
      .from("users")
      .select("referred_by")
      .eq("id", userId)
      .single();
    if (profile?.referred_by && session.amount_total) {
      await admin.from("referrals").insert({
        referrer_id: profile.referred_by,
        referred_user_id: userId,
        commission_status: "approved",
        amount: Math.round(session.amount_total * 0.2) / 100,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const { data: row } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    if (row) {
      const priceId = sub.items.data[0]?.price?.id;
      const tier = priceId ? tierForPriceId(priceId) : null;
      const ended = sub.status === "canceled" || event.type === "customer.subscription.deleted";
      await admin
        .from("subscriptions")
        .update({
          status: ended ? "canceled" : sub.status,
          plan: tier ?? undefined,
          current_period_end: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null,
        })
        .eq("user_id", row.user_id);
      await admin
        .from("users")
        .update({ plan_tier: ended ? "free" : (tier ?? "free") })
        .eq("id", row.user_id);
      if (ended) {
        await admin.from("notifications").insert({
          user_id: row.user_id,
          type: "billing",
          message: "Your subscription has ended. You're back on the Free plan — your products stay yours.",
        });
      }
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
    if (customerId) {
      const { data: row } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();
      if (row) {
        await admin.from("notifications").insert({
          user_id: row.user_id,
          type: "billing",
          message: "A payment failed. Update your payment method to keep your plan active.",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
