import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { buildCoverSpec, renderCoverSvg } from "@/lib/cover";
import { spendCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  let body: { productId?: string; variant?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }
  if (!body.productId) return jsonError(400, "bad_request", "productId is required.");

  // RLS guarantees this only returns the caller's own product
  const { data: product } = await supabase
    .from("products")
    .select("id, title, type")
    .eq("id", body.productId)
    .single();
  if (!product) return jsonError(404, "not_found", "Product not found.");

  const spend = await spendCredits(supabase, user.id, "cover");
  if (!spend.ok) {
    return jsonError(402, "insufficient_credits", "You need 2 credits to generate a cover.");
  }

  const variant = Math.abs(Math.trunc(body.variant ?? 0)) % 32;
  const spec = buildCoverSpec(product.title, product.type, user.email ?? "author", variant);

  await supabase
    .from("products")
    .update({ cover: spec, updated_at: new Date().toISOString() })
    .eq("id", product.id);

  return NextResponse.json({
    cover: spec,
    svg: renderCoverSvg(spec),
    remainingCredits: spend.remaining,
  });
}
