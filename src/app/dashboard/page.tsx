import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { renderCoverSvg, type CoverSpec } from "@/lib/cover";

export const metadata = { title: "Library" };

const STATUS_STYLES: Record<string, string> = {
  draft: "border border-ink/20 text-ink/60",
  generating: "bg-amber/20 text-ink",
  ready: "bg-teal text-paper",
  exported: "bg-sage/40 text-ink",
  failed: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, type, title, status, locale, cover, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your library</h1>
        <Link
          href="/dashboard/new"
          className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark"
        >
          New product
        </Link>
      </div>

      {!products?.length ? (
        <div className="mt-16 rounded border border-dashed border-ink/20 p-14 text-center">
          <p className="font-display text-xl">Nothing here yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
            Start with a topic, a PDF or a URL — you&apos;ll have an exportable draft in
            a few minutes.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-6 inline-block rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/products/${p.id}`}
                className="flex gap-4 rounded border border-ink/10 bg-white/70 p-4 transition-colors hover:border-teal"
              >
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-ink/10 bg-paper">
                  {p.cover ? (
                    <div
                      aria-hidden
                      // Cover SVGs are generated server-side from our own spec — no user HTML
                      dangerouslySetInnerHTML={{ __html: renderCoverSvg(p.cover as CoverSpec) }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[10px] text-ink/30">
                      no cover
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="mt-1 font-mono text-xs text-ink/50">
                    {p.type} · {p.locale} English
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] ${STATUS_STYLES[p.status] ?? ""}`}
                  >
                    {p.status}
                  </span>
                  <p className="mt-2 font-mono text-[11px] text-ink/40">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
