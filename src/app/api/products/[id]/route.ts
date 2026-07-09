import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";

// Inline edits save as a new version (append-only history); DELETE removes the
// product and cascades to versions/checks/exports. RLS scopes everything to
// the owner.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await ctx.params;

  let body: { content?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .single();
  if (!product) return jsonError(404, "not_found", "Product not found.");

  if (typeof body.content === "string") {
    if (body.content.length > 800_000) {
      return jsonError(413, "too_large", "Content is too large.");
    }
    const { data: latest } = await supabase
      .from("product_versions")
      .select("version_number")
      .eq("product_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();
    const { error } = await supabase.from("product_versions").insert({
      product_id: id,
      content: body.content,
      version_number: (latest?.version_number ?? 0) + 1,
      label: "Manual edit",
    });
    if (error) return jsonError(500, "db_error", "Could not save your edit.");
  }

  if (typeof body.title === "string" && body.title.trim()) {
    await supabase
      .from("products")
      .update({ title: body.title.trim().slice(0, 200), updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await supabase
      .from("products")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await ctx.params;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return jsonError(500, "db_error", "Could not delete the product.");
  return NextResponse.json({ ok: true });
}
