// Plan tiers and the visible credit system (PRD Sections 10 + 6.13).
// Credit costs are shown to the user before every generation — no black box.

export type PlanTier = "free" | "starter" | "pro" | "studio";

export interface Plan {
  tier: PlanTier;
  name: string;
  priceUsd: number; // monthly, 0 for free
  monthlyCredits: number;
  watermarkedExports: boolean;
  complianceChecker: boolean;
  localization: boolean;
  priorityGeneration: boolean;
  blurb: string;
  features: string[];
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: "free",
    name: "Free",
    priceUsd: 0,
    monthlyCredits: 30,
    watermarkedExports: true,
    complianceChecker: false,
    localization: false,
    priorityGeneration: false,
    blurb: "Try the full pipeline. Exports carry a small digitalmmm watermark.",
    features: [
      "30 credits per month",
      "Ebook, workbook and planner generators",
      "AI cover maker",
      "PDF and DOCX export (watermarked)",
    ],
  },
  starter: {
    tier: "starter",
    name: "Starter",
    priceUsd: 22,
    monthlyCredits: 300,
    watermarkedExports: false,
    complianceChecker: false,
    localization: false,
    priorityGeneration: false,
    blurb: "Full generators, unlimited exports, no watermark.",
    features: [
      "300 credits per month",
      "All generators, no watermark",
      "Unlimited PDF and DOCX exports",
      "Commercial usage rights on everything you make",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceUsd: 39,
    monthlyCredits: 800,
    watermarkedExports: false,
    complianceChecker: true,
    localization: true,
    priorityGeneration: true,
    blurb: "Adds the KDP compliance checker, localization and priority generation.",
    features: [
      "800 credits per month",
      "Everything in Starter",
      "KDP compliance checker",
      "US/UK localization",
      "Priority generation queue",
    ],
  },
  studio: {
    tier: "studio",
    name: "Studio",
    priceUsd: 129,
    monthlyCredits: 2500,
    watermarkedExports: false,
    complianceChecker: true,
    localization: true,
    priorityGeneration: true,
    blurb:
      "For catalogs and agencies. Research tools, bundling, royalty tracking and distribution automation land here first as they ship.",
    features: [
      "2,500 credits per month",
      "Everything in Pro",
      "Research tools, bundling and royalty tracker as they ship",
      "Demand/Trend Finder and done-for-you storefront — exclusive to Studio",
      "Price-lock guarantee",
    ],
  },
};

// Transparent per-action credit costs (shown in the UI before running anything).
export const CREDIT_COSTS = {
  ebook: 10,
  workbook: 8,
  planner: 6,
  cover: 2,
  compliance: 1,
  localize: 1,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const PRODUCT_TYPES = ["ebook", "workbook", "planner"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export function planFor(tier: string | null | undefined): Plan {
  return PLANS[(tier as PlanTier) ?? "free"] ?? PLANS.free;
}
