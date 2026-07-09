import { NextResponse } from "next/server";
import { createClient, supabaseConfigured } from "./supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

// Every API route authenticates server-side; the client is never trusted to
// report identity, plan or credits (PRD 9A).
export async function requireUser(): Promise<
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: NextResponse }
> {
  if (!supabaseConfigured()) {
    return {
      ok: false,
      response: jsonError(503, "not_configured", "Supabase is not configured on this deployment."),
    };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: jsonError(401, "unauthorized", "Sign in to continue.") };
  }
  return { ok: true, supabase, user };
}

export async function notify(
  supabase: SupabaseClient,
  userId: string,
  type: "generation" | "compliance" | "billing",
  message: string
) {
  await supabase.from("notifications").insert({ user_id: userId, type, message });
}
