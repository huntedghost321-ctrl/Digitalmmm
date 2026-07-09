import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

// GDPR Art. 17 / NDPA erasure. With a service-role key the account and all its
// data are deleted immediately (auth.users cascade removes every table's rows).
// Without one, the request is recorded and handled manually by support within
// the statutory window.
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { supabase, user } = auth;

  let body: { confirm?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body.");
  }
  if (body.confirm !== "DELETE") {
    return jsonError(422, "confirm_required", 'Type "DELETE" to confirm account deletion.');
  }

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return jsonError(500, "delete_failed", "Deletion failed — contact support.");
    return NextResponse.json({ deleted: true });
  }

  await supabase.from("data_requests").insert({ user_id: user.id, kind: "delete" });
  return NextResponse.json({
    deleted: false,
    queued: true,
    message:
      "Your deletion request has been recorded and will be completed by our team within 30 days. You'll receive confirmation by email.",
  });
}
