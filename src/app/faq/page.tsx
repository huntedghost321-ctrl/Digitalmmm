import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Help & FAQ",
  description: "Answers to common questions about digitalmmm, plus how to reach support.",
};

// Basic help/support channel (MVP item 14): FAQ + admin-routed support email.
// Chatbot and full ticketing arrive in Phase 2.
const FAQS: [string, string][] = [
  [
    "What exactly do I get when I generate a product?",
    "A complete, structured draft — an ebook with real chapters, a workbook with exercises, or a planner with labelled sections — that you review and edit inline, plus an optional cover. You export it as PDF or DOCX and it's yours to sell.",
  ],
  [
    "Can I sell what I make? Even on the Free plan?",
    "Yes. Commercial usage rights apply on every tier, including Free. Free-plan exports carry a small digitalmmm watermark; paid plans remove it.",
  ],
  [
    "How do credits work?",
    "Each action has a visible cost — an ebook is 10 credits, a workbook 8, a planner 6, a cover 2, compliance and localization 1 each. Credits refill monthly with your plan. No hidden throttling, no surprise overage bills.",
  ],
  [
    "Do I have to tell Amazon my book was AI-generated?",
    "Yes — KDP requires an AI-content declaration at title setup, and answering it honestly protects your account. Our compliance checker reminds you, and every export carries machine-readable AI-provenance metadata as required by the EU AI Act.",
  ],
  [
    "What sources can I start from?",
    "A plain topic, a public website URL, or a text-based PDF (up to 20 MB). Transcript and audio ingestion, plus Google Docs import, are in development.",
  ],
  [
    "What's the difference between US and UK localization?",
    "A one-click pass that converts spelling (color/colour, organize/organise…) and currency symbols for the market you're selling into. Available on Pro and Studio. Full translation into EU languages is on the roadmap.",
  ],
  [
    "Can I get my data out?",
    "Always. Settings → Export all my data gives you a complete JSON export in one click, and account deletion is self-serve and permanent. GDPR and NDPA rights are built in.",
  ],
  [
    "How do refunds work?",
    "EU/UK buyers keep the 14-day withdrawal right unless they explicitly consent to immediate access at checkout. And if something's broken on our side, we refund the billing period — see the Refund Policy.",
  ],
  [
    "How does the referral program pay?",
    "A flat 20% of your referral's first payment — one-time per referred user, paid out monthly. Your link is in the dashboard under Referrals.",
  ],
  [
    "When are video, marketplaces and research tools coming?",
    "The roadmap is public on the Explore all tools page, grouped by category with honest labels: live, in development, or planned. Studio subscribers get research and distribution tools first as they ship.",
  ],
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Help &amp; FAQ</h1>
        <p className="mt-4 text-ink/75">
          Can&apos;t find your answer? Email{" "}
          <a href="mailto:support@digitalmmm.com" className="font-mono underline underline-offset-2">
            support@digitalmmm.com
          </a>{" "}
          — it routes to our internal support queue and a human replies, usually within
          one business day.
        </p>

        <div className="mt-10 space-y-3">
          {FAQS.map(([q, a]) => (
            <details key={q} className="rounded border border-ink/10 bg-white/60 open:bg-white/90">
              <summary className="cursor-pointer px-5 py-4 font-medium">{q}</summary>
              <p className="border-t border-ink/5 px-5 py-4 text-sm leading-relaxed text-ink/80">{a}</p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
