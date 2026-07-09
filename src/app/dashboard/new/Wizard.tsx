"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CREDIT_COSTS, type ProductType } from "@/lib/plans";

type SourceType = "topic" | "url" | "pdf";

const PRODUCT_OPTIONS: { type: ProductType; name: string; desc: string }[] = [
  { type: "ebook", name: "Ebook", desc: "6–9 chapters of substantive, practical prose. The classic KDP/Gumroad product." },
  { type: "workbook", name: "Workbook", desc: "Teaching blocks plus exercises and reflection prompts readers fill in." },
  { type: "planner", name: "Planner", desc: "Structured planning sections with labelled fields — includes itinerary templates." },
];

export function NewProductWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — source
  const [sourceType, setSourceType] = useState<SourceType>("topic");
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  // Step 2 — type & locale
  const [productType, setProductType] = useState<ProductType>("ebook");
  const [locale, setLocale] = useState<"US" | "UK">("US");

  // Step 3 — generate
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingestUrl = async () => {
    setIngesting(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSourceText(data.text);
      if (!topic) setTopic(data.title);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that URL.");
    } finally {
      setIngesting(false);
    }
  };

  const ingestPdf = async (file: File) => {
    setIngesting(true);
    setError(null);
    setPdfName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ingest", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSourceText(data.text);
      if (!topic) setTopic(data.title);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that PDF.");
      setPdfName(null);
    } finally {
      setIngesting(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: productType,
          topic,
          sourceType,
          sourceText: sourceText ?? undefined,
          sourceLabel: sourceType === "url" ? url : sourceType === "pdf" ? pdfName : topic,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/dashboard/products/${data.productId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
      setGenerating(false);
    }
  };

  const steps = ["Source", "Product type", "Generate"];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">New product</h1>

      <ol className="mt-6 flex gap-2 font-mono text-xs" aria-label="Progress">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded border px-3 py-2 text-center ${
              step === i + 1
                ? "border-teal bg-teal text-paper"
                : step > i + 1
                  ? "border-teal/40 bg-teal/10 text-teal"
                  : "border-ink/15 text-ink/50"
            }`}
            aria-current={step === i + 1 ? "step" : undefined}
          >
            0{i + 1} · {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <section className="mt-8 space-y-5">
          <div className="flex gap-2" role="tablist" aria-label="Source type">
            {(
              [
                ["topic", "Topic"],
                ["url", "Website URL"],
                ["pdf", "PDF"],
              ] as [SourceType, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={sourceType === value}
                onClick={() => {
                  setSourceType(value);
                  setSourceText(null);
                  setError(null);
                }}
                className={`rounded px-4 py-2 text-sm font-medium ${
                  sourceType === value ? "bg-ink text-paper" : "border border-ink/20 hover:bg-ink/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {sourceType === "topic" && (
            <div className="space-y-3">
              <label className="grid gap-1 text-sm">
                What should this product be about?
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. A 30-day meal-prep system for busy parents who hate cooking"
                  className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </label>
              <button
                onClick={() => topic.trim() && setStep(2)}
                disabled={!topic.trim()}
                className="rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {sourceType === "url" && (
            <div className="space-y-3">
              <label className="grid gap-1 text-sm">
                Public page to build from
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/your-long-article"
                  className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </label>
              <label className="grid gap-1 text-sm">
                Angle or topic (optional — we&apos;ll use the page title if empty)
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={500}
                  className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </label>
              <button
                onClick={ingestUrl}
                disabled={!url.trim() || ingesting}
                className="rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
              >
                {ingesting ? "Reading page…" : "Read page & continue"}
              </button>
            </div>
          )}

          {sourceType === "pdf" && (
            <div className="space-y-3">
              <label className="block rounded border-2 border-dashed border-ink/20 bg-white/60 p-8 text-center text-sm hover:border-teal">
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) ingestPdf(f);
                  }}
                />
                {ingesting
                  ? "Extracting text…"
                  : pdfName
                    ? `Selected: ${pdfName}`
                    : "Click to choose a PDF (up to 20 MB, text-based)"}
              </label>
              <label className="grid gap-1 text-sm">
                Angle or topic (optional)
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={500}
                  className="rounded border border-ink/20 bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </label>
            </div>
          )}

          {error && <p className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {PRODUCT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setProductType(opt.type)}
                aria-pressed={productType === opt.type}
                className={`rounded border p-4 text-left ${
                  productType === opt.type
                    ? "border-teal bg-teal/5 ring-1 ring-teal"
                    : "border-ink/15 bg-white/60 hover:border-ink/30"
                }`}
              >
                <p className="font-display text-lg font-semibold">{opt.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">{opt.desc}</p>
                <p className="mt-3 font-mono text-xs text-teal">{CREDIT_COSTS[opt.type]} credits</p>
              </button>
            ))}
          </div>

          <fieldset>
            <legend className="text-sm font-medium">English variant</legend>
            <div className="mt-2 flex gap-2">
              {(["US", "UK"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={`rounded px-4 py-2 font-mono text-sm ${
                    locale === l ? "bg-ink text-paper" : "border border-ink/20 hover:bg-ink/5"
                  }`}
                >
                  {l === "US" ? "US · $" : "UK · £"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="rounded border border-ink/20 px-5 py-2.5 text-sm hover:bg-ink/5">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 space-y-5">
          <div className="rounded border border-ink/10 bg-white/70 p-5 text-sm">
            <h2 className="font-display text-lg font-semibold">Ready to generate</h2>
            <dl className="mt-3 grid gap-2">
              <div className="flex justify-between gap-6">
                <dt className="text-ink/60">Product</dt>
                <dd className="font-medium capitalize">{productType}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink/60">Source</dt>
                <dd className="max-w-[60%] truncate font-medium">
                  {sourceType === "topic" ? topic : sourceType === "url" ? url : pdfName}
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink/60">English</dt>
                <dd className="font-mono">{locale}</dd>
              </div>
              <div className="flex justify-between gap-6 border-t border-ink/10 pt-2">
                <dt className="text-ink/60">Cost</dt>
                <dd className="font-mono text-teal">{CREDIT_COSTS[productType]} credits</dd>
              </div>
            </dl>
          </div>
          {error && <p className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={generating}
              className="rounded border border-ink/20 px-5 py-2.5 text-sm hover:bg-ink/5 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={generate}
              disabled={generating}
              className="rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark disabled:opacity-50"
            >
              {generating ? "Generating — this takes a minute or two…" : "Generate draft"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
