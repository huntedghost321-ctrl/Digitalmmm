import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { buildPdf } from "@/lib/export/pdf";
import { buildDocx } from "@/lib/export/docx";
import { planFor } from "@/lib/plans";
import type { CoverSpec } from "@/lib/cover";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  let body: { productId?: string; format?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }
  const format = body.format === "docx" ? "docx" : body.format === "pdf" ? "pdf" : null;
  if (!body.productId || !format) {
    return jsonError(400, "bad_request", "productId and format (pdf or docx) are required.");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, title, type, cover, status")
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
  if (!version) return jsonError(422, "no_content", "Generate content before exporting.");

  const { data: profile } = await supabase
    .from("users")
    .select("plan_tier")
    .eq("id", user.id)
    .single();
  const watermark = planFor(profile?.plan_tier).watermarkedExports;

  const bytes =
    format === "pdf"
      ? await buildPdf({
          title: product.title,
          content: version.content,
          cover: (product.cover as CoverSpec | null) ?? null,
          productId: product.id,
          watermark,
        })
      : await buildDocx({
          title: product.title,
          content: version.content,
          productId: product.id,
          watermark,
        });

  await supabase.from("exports").insert({ product_id: product.id, format });
  await supabase
    .from("products")
    .update({ status: "exported", updated_at: new Date().toISOString() })
    .eq("id", product.id);

  const filename = `${product.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "product"}.${format}`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type":
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
