import Stripe from "stripe";
import type { PlanTier } from "./plans";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export function priceIdFor(tier: PlanTier): string | undefined {
  const map: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    studio: process.env.STRIPE_PRICE_STUDIO,
  };
  return map[tier];
}

export function tierForPriceId(priceId: string): PlanTier | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_STUDIO) return "studio";
  return null;
}
