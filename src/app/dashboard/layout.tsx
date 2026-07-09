import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "@/components/NotificationBell";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import { planFor } from "@/lib/plans";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, balance] = await Promise.all([
    supabase.from("users").select("plan_tier").eq("id", user.id).single(),
    getBalance(supabase, user.id).catch(() => 0),
  ]);
  const plan = planFor(profile?.plan_tier);

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 text-sm text-ink/80 sm:flex" aria-label="Studio">
              <Link href="/dashboard" className="hover:text-ink">Library</Link>
              <Link href="/dashboard/new" className="hover:text-ink">New product</Link>
              <Link href="/dashboard/referrals" className="hover:text-ink">Referrals</Link>
              <Link href="/dashboard/settings" className="hover:text-ink">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              title={`${plan.name} plan — credits refill monthly`}
              className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/80 hover:bg-ink/5"
            >
              {balance} credits · {plan.name}
            </Link>
            <NotificationBell />
            <form action="/auth/signout" method="post">
              <button className="text-sm text-ink/60 hover:text-ink" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
