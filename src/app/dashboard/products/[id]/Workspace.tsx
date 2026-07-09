"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { renderCoverSvg, type CoverSpec } from "@/lib/cover";
import type { ComplianceFlag } from "@/lib/compliance";

interface Props {
  product: {
    id: string;
    type: string;
    title: string;
    status: string;
    locale: "US" | "UK";
    cover: CoverSpec | null;
  };
  initialContent: string;
  versionNumber: number;
  lastCheck: { flags: ComplianceFlag[]; passed: boolean } | null;
  planCan: { compliance: boolean; localization: boolean };
}

// The single product workspace: review/edit inline → cover → compliance →
// localization → export (core user flow, PRD Section 7, steps 4–8).
export function ProductWorkspace({ product, initialContent, versionNumber, lastCheck, planCan }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState<CoverSpec | null>(product.cover);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverVariant, setCoverVariant] = useState(1);
  const [check, setCheck] = useState(lastCheck);
  const [checkBusy, setCheckBusy] = useState(false);
  const [locale, setLocale] = useState(product.locale);
  const [localizeBusy, setLocalizeBusy] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const words = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  const api = async (path: string, body: object) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Something went wrong.");
    return data;
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setDirty(false);
      setNotice("Saved as a new version.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const makeCover = async () => {
    setCoverBusy(true);
    setError(null);
    try {
      const data = await api("/api/cover", { productId: product.id, variant: coverVariant });
      setCover(data.cover);
      setCoverVariant((v) => v + 1);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cover generation failed.");
    } finally {
      setCoverBusy(false);
    }
  };

  const runCheck = async () => {
    setCheckBusy(true);
    setError(null);
    try {
      const data = await api("/api/compliance", { productId: product.id });
      setCheck({ flags: data.flags, passed: data.passed });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compliance check failed.");
    } finally {
      setCheckBusy(false);
    }
  };

  const localize = async (target: "US" | "UK") => {
    setLocalizeBusy(true);
    setError(null);
    try {
      await api("/api/localize", { productId: product.id, target });
      setLocale(target);
      setNotice(`Localized to ${target} English — reloading…`);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Localization failed.");
      setLocalizeBusy(false);
    }
  };

  const doExport = async (format: "pdf" | "docx") => {
    setExporting(format);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, format }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this product and all its versions? This can't be undone.")) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  };

  const severityStyle: Record<string, string> = {
    blocker: "border-red-300 bg-red-50 text-red-900",
    warning: "border-amber bg-amber/10 text-ink",
    info: "border-sage bg-sage/10 text-ink",
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{product.title}</h1>
          <p className="font-mono text-xs text-ink/50">
            {product.type} · v{versionNumber} · {words.toLocaleString()} words · {locale} English
          </p>
        </div>

        {(error || notice) && (
          <p
            className={`mt-4 rounded p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-teal/10 text-teal"}`}
            role="status"
          >
            {error ?? notice}
          </p>
        )}

        {product.status === "failed" && !content ? (
          <p className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Generation failed for this product. Start a new one from the wizard — if it
            keeps happening, email support@digitalmmm.com.
          </p>
        ) : (
          <>
            <label className="sr-only" htmlFor="editor">
              Product content (Markdown)
            </label>
            <textarea
              id="editor"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
                setNotice(null);
              }}
              spellCheck={false}
              className="mt-5 h-[60vh] w-full resize-y rounded border border-ink/15 bg-white p-5 font-mono text-sm leading-relaxed outline-none focus:border-teal"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
              >
                {saving ? "Saving…" : dirty ? "Save as new version" : "Saved"}
              </button>
              <span className="text-xs text-ink/50">
                Edits are saved as versions — nothing is overwritten.
              </span>
            </div>
          </>
        )}
      </div>

      <aside className="space-y-6">
        {/* Cover */}
        <section className="rounded border border-ink/10 bg-white/70 p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink/50">Cover</h2>
          <div className="mx-auto mt-3 w-40 overflow-hidden rounded-sm border border-ink/10 shadow-sm">
            {cover ? (
              <div aria-label="Cover preview" dangerouslySetInnerHTML={{ __html: renderCoverSvg(cover) }} />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center bg-paper font-mono text-xs text-ink/40">
                no cover yet
              </div>
            )}
          </div>
          <button
            onClick={makeCover}
            disabled={coverBusy}
            className="mt-3 w-full rounded border border-teal px-3 py-2 text-sm font-medium text-teal hover:bg-teal hover:text-paper disabled:opacity-50"
          >
            {coverBusy ? "Generating…" : cover ? "Try another cover · 2 credits" : "Generate cover · 2 credits"}
          </button>
        </section>

        {/* Compliance */}
        <section className="rounded border border-ink/10 bg-white/70 p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink/50">
            KDP compliance
          </h2>
          {planCan.compliance ? (
            <>
              <button
                onClick={runCheck}
                disabled={checkBusy || !content}
                className="mt-3 w-full rounded border border-teal px-3 py-2 text-sm font-medium text-teal hover:bg-teal hover:text-paper disabled:opacity-50"
              >
                {checkBusy ? "Checking…" : "Run check · 1 credit"}
              </button>
              {check && (
                <div className="mt-3 space-y-2">
                  <p className={`font-mono text-xs ${check.passed ? "text-teal" : "text-red-700"}`}>
                    {check.passed ? "✓ No blockers" : "✗ Blockers found"}
                  </p>
                  {check.flags.map((flag) => (
                    <details key={flag.code} className={`rounded border p-2.5 text-xs ${severityStyle[flag.severity]}`}>
                      <summary className="cursor-pointer font-medium">
                        {flag.severity === "blocker" ? "Blocker: " : flag.severity === "warning" ? "Warning: " : ""}
                        {flag.title}
                      </summary>
                      <p className="mt-1.5 leading-relaxed">{flag.detail}</p>
                    </details>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs text-ink/60">
              Available on Pro and Studio.{" "}
              <a href="/pricing" className="underline decoration-amber underline-offset-2">
                Upgrade
              </a>
            </p>
          )}
        </section>

        {/* Localization */}
        <section className="rounded border border-ink/10 bg-white/70 p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink/50">Localization</h2>
          {planCan.localization ? (
            <div className="mt-3 flex gap-2">
              {(["US", "UK"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => l !== locale && localize(l)}
                  disabled={localizeBusy || l === locale}
                  className={`flex-1 rounded px-3 py-2 font-mono text-sm ${
                    l === locale
                      ? "bg-ink text-paper"
                      : "border border-ink/20 hover:bg-ink/5 disabled:opacity-50"
                  }`}
                >
                  {l === "US" ? "US · $" : "UK · £"}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink/60">
              Available on Pro and Studio.{" "}
              <a href="/pricing" className="underline decoration-amber underline-offset-2">
                Upgrade
              </a>
            </p>
          )}
        </section>

        {/* Export */}
        <section className="rounded border border-ink/10 bg-white/70 p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink/50">Export</h2>
          <div className="mt-3 grid gap-2">
            <button
              onClick={() => doExport("pdf")}
              disabled={!!exporting || !content}
              className="rounded bg-teal px-3 py-2 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
            >
              {exporting === "pdf" ? "Building PDF…" : "Download PDF"}
            </button>
            <button
              onClick={() => doExport("docx")}
              disabled={!!exporting || !content}
              className="rounded border border-teal px-3 py-2 text-sm font-medium text-teal hover:bg-teal hover:text-paper disabled:opacity-50"
            >
              {exporting === "docx" ? "Building DOCX…" : "Download DOCX"}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
            Exports include machine-readable AI-provenance metadata (EU AI Act, Art. 50).
            Free-plan files carry a small watermark.
          </p>
        </section>

        <button onClick={remove} className="w-full rounded px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50">
          Delete this product…
        </button>
      </aside>
    </div>
  );
}
