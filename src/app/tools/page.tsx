import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Explore all tools",
  description:
    "Every digitalmmm tool by category — what's live today, what's shipping next.",
};

// The full catalog lives here with progressive disclosure (PRD Section 4) —
// grouped by the same categories as the spec, expandable, honest phase labels.
type Status = "live" | "phase2" | "phase3";

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  phase2: "In development",
  phase3: "Planned",
};

interface Category {
  name: string;
  intro: string;
  open?: boolean;
  tools: { name: string; status: Status; note?: string }[];
}

const CATEGORIES: Category[] = [
  {
    name: "Create Source",
    intro: "The front door of the pipeline — raw material becomes the brief every generator works from.",
    open: true,
    tools: [
      { name: "Topic input", status: "live" },
      { name: "Website URL ingestion", status: "live" },
      { name: "PDF ingestion", status: "live" },
      { name: "Transcript & audio ingestion", status: "phase2" },
      { name: "Custom LLM style instructions", status: "phase2" },
      { name: "Google Docs / Sheets / Slides import", status: "phase2" },
    ],
  },
  {
    name: "Core Generators",
    intro: "Each product type is its own template flow — structure is what makes output sellable.",
    open: true,
    tools: [
      { name: "AI Ebook Maker", status: "live" },
      { name: "AI Workbook Maker", status: "live" },
      { name: "AI Planner Maker", status: "live", note: "includes itinerary templates" },
      { name: "AI Journal Maker", status: "phase2" },
      { name: "AI Spreadsheet Maker", status: "phase2" },
      { name: "Presentation Maker (PPTX)", status: "phase2" },
      { name: "Resume/CV Maker", status: "phase2" },
      { name: "Printable & Coloring Page Maker", status: "phase2" },
      { name: "Puzzle & Activity Sheet Maker", status: "phase2" },
      { name: "Audiobook Maker", status: "phase2" },
      { name: "Preset Pack Maker (XMP/LUT)", status: "phase2" },
      { name: "Caption & Hashtag Pack Maker", status: "phase2" },
      { name: "AI Prompt Pack Maker", status: "phase2" },
      { name: "Invoice / Contract / Proposal Maker", status: "phase2" },
      { name: "Certificate & Award Maker", status: "phase2" },
      { name: "Digital Sticker Pack Maker", status: "phase2" },
      { name: "Product Mockup Generator", status: "phase2" },
      { name: "Email Signature Maker", status: "phase2" },
      { name: "Icon & Font Pairing Kits", status: "phase2" },
      { name: "Sound Effects & Audio Packs", status: "phase2" },
      { name: "Website/Landing Page Template Packs", status: "phase2" },
    ],
  },
  {
    name: "Create Visual",
    intro: "Covers today; a full visual toolchain as the studio grows.",
    open: true,
    tools: [
      { name: "AI Cover Maker", status: "live", note: "vector output, print-crisp" },
      { name: "AI Image Maker (full)", status: "phase2" },
      { name: "AI Logo Maker + Brand Kit", status: "phase2" },
      { name: "Vector generator & vectorizer", status: "phase2" },
      { name: "AI Video Maker & UGC promo videos", status: "phase2", note: "with mandatory AI disclosure where required" },
      { name: "AI Clip Generator", status: "phase2" },
      { name: "Motion Design Maker", status: "phase2" },
      { name: "Background remover, resizer, converters", status: "phase2" },
      { name: "Auto-captions, transcription, audio cleanup", status: "phase2" },
      { name: "Podcast Producer", status: "phase2" },
    ],
  },
  {
    name: "Research & Strategy",
    intro: "Validate demand before you generate.",
    tools: [
      { name: "Competitor Analyzer", status: "phase2" },
      { name: "Demand/Trend Finder", status: "phase2", note: "Studio tier only" },
      { name: "Store Finder", status: "phase2" },
      { name: "Meta Ad Library access", status: "phase2" },
      { name: "Product structure replication", status: "phase2", note: "structure & positioning only — never another creator's content" },
    ],
  },
  {
    name: "Copy & Marketing",
    intro: "Sales copy that ships with the product.",
    tools: [
      { name: "Auto-generated sales copy with every product", status: "phase2" },
      { name: "Prompt Builder", status: "phase2" },
    ],
  },
  {
    name: "Compliance & Localization",
    intro: "The checks competitors don't do.",
    open: true,
    tools: [
      { name: "KDP Compliance Checker", status: "live", note: "Pro & Studio" },
      { name: "US/UK localization", status: "live", note: "Pro & Studio" },
      { name: "Content Originality Checker", status: "phase2" },
      { name: "EAA/Accessibility Checker (WCAG 2.1 AA)", status: "phase2" },
      { name: "Full translation & dubbing", status: "phase3" },
    ],
  },
  {
    name: "Distribution",
    intro: "From export file to storefront.",
    tools: [
      { name: "PDF & DOCX export", status: "live" },
      { name: "Auto-listing to Gumroad / KDP / Shopify", status: "phase2" },
      { name: "Native Marketplace (10% fee)", status: "phase2" },
      { name: "AI Website Builder", status: "phase3" },
      { name: "Create Post — 9-platform publishing", status: "phase3" },
    ],
  },
  {
    name: "Bundling & Revenue",
    intro: "The closed loop: what you made, and whether it sells.",
    tools: [
      { name: "Referral program — 20% of first payment", status: "live" },
      { name: "Bundling engine", status: "phase2" },
      { name: "Royalty & earnings tracker", status: "phase2" },
      { name: "Per-product affiliate program", status: "phase2" },
    ],
  },
  {
    name: "Templates & Systems",
    intro: "Repeatable systems, not one-off builds.",
    tools: [
      { name: "AI Template & System Builder (Notion + web)", status: "phase2" },
      { name: "Template Gallery", status: "phase3" },
      { name: "Design Canvas & visual editor", status: "phase3" },
      { name: "Community Template Marketplace", status: "phase3" },
    ],
  },
  {
    name: "Teams & Platform",
    intro: "For agencies and growing catalogs.",
    tools: [
      { name: "Visible credit system", status: "live" },
      { name: "Notification bell", status: "live" },
      { name: "GDPR/NDPA data export & deletion", status: "live" },
      { name: "Team & agency accounts, white-label", status: "phase2" },
      { name: "Two-factor authentication", status: "phase2" },
      { name: "Zapier, webhooks & public API", status: "phase2" },
      { name: "Mini-course/LMS builder, POD, email marketing", status: "phase2" },
      { name: "Real-time co-editing", status: "phase3" },
    ],
  },
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    live: "bg-teal text-paper",
    phase2: "bg-amber/20 text-ink",
    phase3: "border border-ink/20 text-ink/60",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Explore all tools</h1>
        <p className="mt-4 max-w-2xl text-ink/75">
          Everything in the studio, by category. We label honestly: what&apos;s live,
          what&apos;s in development, what&apos;s planned. No tool ships without a real,
          downloadable output.
        </p>

        <div className="mt-10 space-y-4">
          {CATEGORIES.map((cat) => (
            <details
              key={cat.name}
              open={cat.open}
              className="group rounded border border-ink/10 bg-white/50 open:bg-white/80"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                <span>
                  <span className="font-display text-xl font-semibold">{cat.name}</span>
                  <span className="ml-3 hidden text-sm text-ink/60 sm:inline">{cat.intro}</span>
                </span>
                <span className="font-mono text-xs text-ink/50 group-open:hidden">show</span>
                <span className="hidden font-mono text-xs text-ink/50 group-open:inline">hide</span>
              </summary>
              <ul className="divide-y divide-ink/5 border-t border-ink/10 px-5">
                {cat.tools.map((tool) => (
                  <li key={tool.name} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm">
                      {tool.name}
                      {tool.note && <span className="ml-2 text-xs text-ink/50">({tool.note})</span>}
                    </span>
                    <StatusBadge status={tool.status} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded bg-ink p-8 text-paper">
          <h2 className="font-display text-2xl font-semibold">Start with what&apos;s live</h2>
          <p className="mt-2 text-paper/75">
            Ebooks, workbooks and planners — from source to export — work today.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded bg-amber px-5 py-2.5 font-medium text-ink hover:brightness-105"
          >
            Start free
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
