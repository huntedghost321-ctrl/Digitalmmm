import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { localizeContent } from "@/lib/localize";
import { spendCredits } from "@/lib/credits";
import { planFor } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  let body: { productId?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }
  const target = body.target === "UK" ? "UK" : body.target === "US" ? "US" : null;
  if (!body.productId || !target) {
    return jsonError(400, "bad_request", "productId and target (US or UK) are required.");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan_tier")
    .eq("id", user.id)
    .single();
  if (!planFor(profile?.plan_tier).localization) {
    return jsonError(403, "plan_required", "Localization is available on Pro and Studio plans.");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, locale")
    .eq("id", body.productId)
    .single();
  if (!product) return jsonError(404, "not_found", "Product not found.");
  if (product.locale === target) {
    return jsonError(409, "already_localized", `This product is already in ${target} English.`);
  }

  const { data: version } = await supabase
    .from("product_versions")
    .select("content, version_number")
    .eq("product_id", product.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (!version) return jsonError(422, "no_content", "This product has no content yet.");

  const spend = await spendCredits(supabase, user.id, "localize");
  if (!spend.ok) return jsonError(402, "insufficient_credits", "You need 1 credit to localize.");

  const localized = localizeContent(version.content, target);

  await supabase.from("product_versions").insert({
    product_id: product.id,
    content: localized,
    version_number: version.version_number + 1,
    label: `Localized to ${target} English`,
  });
  await supabase
    .from("products")
    .update({ locale: target, updated_at: new Date().toISOString() })
    .eq("id", product.id);

  return NextResponse.json({
    locale: target,
    versionNumber: version.version_number + 1,
    remainingCredits: spend.remaining,
  });
}
