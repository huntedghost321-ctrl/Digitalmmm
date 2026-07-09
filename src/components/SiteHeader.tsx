import Link from "next/link";
import { Logo } from "./Logo";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export async function SiteHeader() {
  let signedIn = false;
  if (supabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  return (
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink/80 sm:flex" aria-label="Main">
          <Link href="/tools" className="hover:text-ink">Explore all tools</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/faq" className="hover:text-ink">Help &amp; FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark"
            >
              Open studio
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink/80 hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
