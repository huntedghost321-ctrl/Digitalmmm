import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AssemblyLine } from "@/components/AssemblyLine";
import { TrustpilotWidget } from "@/components/Trustpilot";

// Homepage: the signature assembly-line hero plus a curated set of headline
// differentiators — never the full feature list (PRD Section 4, feature-scale
// warning). Everything else lives on /tools.
const DIFFERENTIATORS: { title: string; body: string }[] = [
  {
    title: "Start from anything",
    body: "Paste a topic, drop in a PDF, or point us at a web page. Create Source turns raw material into the brief every generator works from.",
  },
  {
    title: "Real books, not walls of text",
    body: "Each product type has its own template flow — an ebook is structured like an ebook, a workbook has exercises you can actually fill in.",
  },
  {
    title: "Covers included",
    body: "Generate a cover in the same pass. Crisp vector output that stays sharp in print and as a storefront thumbnail.",
  },
  {
    title: "Compliance before you publish",
    body: "The KDP checker flags AI-disclosure requirements, low-content risk and duplicated sections before Amazon does.",
  },
  {
    title: "US and UK editions in one click",
    body: "Localization rewrites spelling and currency for the market you're selling into. EU languages are on the roadmap.",
  },
  {
    title: "Downloads you own",
    body: "Every product exports as a real PDF or DOCX file — no in-app-only content, no lock-in, one-click export of everything you've made.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-20 text-center sm:pt-28">
          <h1 className="font-display mx-auto max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Raw material in.
            <br />
            <span className="text-teal">Finished products out.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/75">
            digitalmmm turns a topic, a PDF or a website into a sellable ebook,
            workbook or planner — cover, compliance check and export included.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded bg-teal px-6 py-3 font-medium text-paper hover:bg-teal-dark"
            >
              Generate your first product
            </Link>
            <Link href="/tools" className="text-sm text-ink/70 underline decoration-amber underline-offset-4 hover:text-ink">
              Explore all tools
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-ink/50">
            Free plan · 30 credits/month · an ebook costs 10 credits
          </p>
        </section>

        {/* Signature assembly line */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-6">
          <AssemblyLine />
        </section>

        {/* The pipeline is a real sequence — numbering is earned here */}
        <section className="bg-ink py-20 text-paper">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              One pipeline, three stages
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  name: "Source",
                  body: "Bring a topic, a PDF or a URL. We extract the substance and keep your voice.",
                },
                {
                  n: "02",
                  name: "Create",
                  body: "Generate the manuscript and its cover, edit inline, run the compliance check, localize for your market.",
                },
                {
                  n: "03",
                  name: "Distribute",
                  body: "Export print-ready PDF or editable DOCX and list it anywhere. Auto-listing and a native marketplace are next on the roadmap.",
                },
              ].map((stage) => (
                <div key={stage.n}>
                  <p className="font-mono text-sm text-amber">{stage.n}</p>
                  <h3 className="font-display mt-2 text-2xl font-semibold">{stage.name}</h3>
                  <p className="mt-3 text-paper/75">{stage.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curated differentiators — 6, not 60 */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Built to finish, not just to draft
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="border-t-2 border-teal pt-4">
                <h3 className="text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{d.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-ink/60">
            Research tools, video, bundling, auto-listing and a native marketplace
            are in active development —{" "}
            <Link href="/tools" className="underline decoration-amber underline-offset-2">
              see the full roadmap by category
            </Link>
            .
          </p>
        </section>

        {/* Trust */}
        <section className="border-t border-ink/10 bg-paper py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-display text-2xl font-semibold">What creators say</h2>
            <div className="mt-6">
              <TrustpilotWidget />
            </div>
            <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
              {[
                ["Commercial rights on every plan", "What you generate is yours to sell. Usage rights are stated per tier — no fine print surprises."],
                ["Price-lock guarantee", "Your subscription price never rises while you stay subscribed."],
                ["No lock-in", "Export every product you've made, in one click, any time. GDPR & NDPA data rights built in."],
              ].map(([title, body]) => (
                <div key={title} className="rounded border border-ink/10 bg-white/60 p-5">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-teal">{title}</h3>
                  <p className="mt-2 text-sm text-ink/75">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
