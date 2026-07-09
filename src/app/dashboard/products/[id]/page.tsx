import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { planFor } from "@/lib/plans";
import { ProductWorkspace } from "./Workspace";
import type { CoverSpec } from "@/lib/cover";
import type { ComplianceFlag } from "@/lib/compliance";

export const metadata = { title: "Product" };

export default async function ProductPage(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, type, title, status, locale, cover, source_type, created_at")
    .eq("id", id)
    .single();
  if (!product) notFound();

  const [{ data: version }, { data: lastCheck }, { data: { user } }] = await Promise.all([
    supabase
      .from("product_versions")
      .select("content, version_number, label, created_at")
      .eq("product_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("compliance_checks")
      .select("flags, passed, checked_at")
      .eq("product_id", id)
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const { data: profile } = await supabase
    .from("users")
    .select("plan_tier")
    .eq("id", user!.id)
    .single();
  const plan = planFor(profile?.plan_tier);

  return (
    <ProductWorkspace
      product={{
        id: product.id,
        type: product.type,
        title: product.title,
        status: product.status,
        locale: product.locale as "US" | "UK",
        cover: (product.cover as CoverSpec | null) ?? null,
      }}
      initialContent={version?.content ?? ""}
      versionNumber={version?.version_number ?? 0}
      lastCheck={
        lastCheck
          ? { flags: lastCheck.flags as ComplianceFlag[], passed: lastCheck.passed }
          : null
      }
      planCan={{ compliance: plan.complianceChecker, localization: plan.localization }}
    />
  );
}
