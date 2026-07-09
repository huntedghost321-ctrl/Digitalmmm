"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Email + Google + GitHub from day one (MVP item 1). Signup carries the
// referral code (?ref=) into user metadata for the profile trigger.
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const next = params.get("next") ?? "/dashboard";
  const refCode = params.get("ref") ?? "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: refCode ? { referred_by_code: refCode } : undefined,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setNotice("Check your inbox — we sent you a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ""}`,
      },
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {mode === "login" ? "Sign in" : "Create your studio"}
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="underline decoration-amber underline-offset-2">
              Start free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline decoration-amber underline-offset-2">
              Sign in
            </Link>
          </>
        )}
      </p>

      {!configured && (
        <p className="mt-6 rounded border border-amber bg-amber/10 p-3 text-sm">
          Authentication isn&apos;t configured on this deployment yet. Set the Supabase
          environment variables to enable sign-in.
        </p>
      )}

      <div className="mt-6 grid gap-2">
        <button
          onClick={() => oauth("google")}
          disabled={!configured}
          className="rounded border border-ink/20 px-4 py-2.5 text-sm font-medium hover:bg-ink/5 disabled:opacity-50"
        >
          Continue with Google
        </button>
        <button
          onClick={() => oauth("github")}
          disabled={!configured}
          className="rounded border border-ink/20 px-4 py-2.5 text-sm font-medium hover:bg-ink/5 disabled:opacity-50"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-ink/40">
        <span className="h-px flex-1 bg-ink/10" />
        or with email
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={submit} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded bg-teal/10 p-2 text-sm text-teal">{notice}</p>}
        <button
          type="submit"
          disabled={!configured || busy}
          className="rounded bg-teal px-4 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
        >
          {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      {mode === "signup" && (
        <p className="mt-4 text-xs text-ink/60">
          By creating an account you agree to the{" "}
          <Link href="/legal/terms" className="underline underline-offset-2">Terms</Link>,{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2">Privacy Policy</Link> and{" "}
          <Link href="/legal/acceptable-use" className="underline underline-offset-2">Acceptable Use Policy</Link>.
          {refCode && (
            <span className="mt-1 block font-mono text-teal">Referral code applied: {refCode}</span>
          )}
        </p>
      )}
    </div>
  );
}
