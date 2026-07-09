import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError, notify } from "@/lib/api";
import { runComplianceCheck } from "@/lib/compliance";
import { spendCredits } from "@/lib/credits";
import { planFor } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }
  if (!body.productId) return jsonError(400, "bad_request", "productId is required.");

  // Plan gate checked server-side, never trusted from the client
  const { data: profile } = await supabase
    .from("users")
    .select("plan_tier")
    .eq("id", user.id)
    .single();
  if (!planFor(profile?.plan_tier).complianceChecker) {
    return jsonError(403, "plan_required", "The KDP compliance checker is available on Pro and Studio plans.");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, type, title")
    .eq("id", body.productId)
    .single();
  if (!product) return jsonError(404, "not_found", "Product not found.");

  const { data: version } = await supabase
    .from("product_versions")
    .select("content")
    .eq("product_id", product.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (!version) return jsonError(422, "no_content", "This product has no content yet.");

  const spend = await spendCredits(supabase, user.id, "compliance");
  if (!spend.ok) return jsonError(402, "insufficient_credits", "You need 1 credit to run a compliance check.");

  const result = runComplianceCheck(version.content, product.type);

  await supabase.from("compliance_checks").insert({
    product_id: product.id,
    flags: result.flags,
    passed: result.passed,
  });

  await notify(
    supabase,
    user.id,
    "compliance",
    result.passed
      ? `“${product.title}” passed the KDP compliance check (${result.flags.length} note${result.flags.length === 1 ? "" : "s"}).`
      : `“${product.title}” has compliance blockers to resolve before publishing.`
  );

  return NextResponse.json({ ...result, remainingCredits: spend.remaining });
}
