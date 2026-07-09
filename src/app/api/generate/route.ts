import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError, notify } from "@/lib/api";
import { anthropicConfigured, generateProductContent, titleFromContent } from "@/lib/generation";
import { spendCredits } from "@/lib/credits";
import { CREDIT_COSTS, PRODUCT_TYPES, type ProductType } from "@/lib/plans";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  if (!anthropicConfigured()) {
    return jsonError(503, "not_configured", "AI generation is not configured on this deployment.");
  }

  let body: {
    type?: string;
    topic?: string;
    sourceType?: string;
    sourceText?: string;
    sourceLabel?: string;
    locale?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }

  const type = body.type as ProductType;
  if (!PRODUCT_TYPES.includes(type)) {
    return jsonError(400, "bad_request", "type must be ebook, workbook or planner.");
  }
  const topic = (body.topic ?? "").trim();
  if (!topic || topic.length > 500) {
    return jsonError(400, "bad_request", "Provide a topic (up to 500 characters).");
  }
  const sourceType = ["topic", "url", "pdf"].includes(body.sourceType ?? "")
    ? (body.sourceType as "topic" | "url" | "pdf")
    : "topic";
  const locale = body.locale === "UK" ? "UK" : "US";

  // Server-side credit check — atomic spend, never client-reported
  const spend = await spendCredits(supabase, user.id, type);
  if (!spend.ok) {
    return jsonError(402, "insufficient_credits", `You need ${CREDIT_COSTS[type]} credits for a ${type}. Upgrade your plan or wait for your monthly refill.`);
  }

  // Create the product row up front so a failed generation is visible, not silent
  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      type,
      title: topic.slice(0, 200),
      status: "generating",
      source_type: sourceType,
      source_content: body.sourceLabel?.slice(0, 2000) ?? topic,
      locale,
    })
    .select()
    .single();
  if (insertError || !product) {
    return jsonError(500, "db_error", "Could not create the product.");
  }

  try {
    const content = await generateProductContent({
      type,
      topic,
      sourceText: body.sourceText?.slice(0, 120_000),
      locale,
    });

    const title = titleFromContent(content, topic);

    const { error: versionError } = await supabase.from("product_versions").insert({
      product_id: product.id,
      content,
      version_number: 1,
      label: "Initial draft",
    });
    if (versionError) throw versionError;

    await supabase
      .from("products")
      .update({ title, status: "ready", updated_at: new Date().toISOString() })
      .eq("id", product.id);

    await notify(supabase, user.id, "generation", `Your ${type} “${title}” is ready to review.`);

    return NextResponse.json({ productId: product.id, title, remainingCredits: spend.remaining });
  } catch {
    await supabase.from("products").update({ status: "failed" }).eq("id", product.id);
    await notify(supabase, user.id, "generation", `Generation failed for “${topic}”. Your credits were spent on the attempt — contact support if this keeps happening.`);
    return jsonError(502, "generation_failed", "Generation failed. Please try again.");
  }
}
