import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS: { heading: string; links: [string, string][] }[] = [
  {
    heading: "Product",
    links: [
      ["Explore all tools", "/tools"],
      ["Pricing", "/pricing"],
      ["Help & FAQ", "/faq"],
    ],
  },
  {
    heading: "Legal",
    links: [
      ["Terms & Conditions", "/legal/terms"],
      ["Privacy Policy", "/legal/privacy"],
      ["Refund Policy", "/legal/refunds"],
      ["Acceptable Use", "/legal/acceptable-use"],
      ["AI Disclosure", "/legal/ai-disclosure"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo dark />
          <p className="max-w-xs text-sm text-paper/70">
            Raw material in. Finished, sellable digital products out.
          </p>
          <p className="font-mono text-xs text-paper/50">support@digitalmmm.com</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-sage">{col.heading}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-paper/80 hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} digitalmmm. All rights reserved.</p>
          <p>
            AI-generated exports carry machine-readable provenance marking (EU AI Act, Art. 50).
          </p>
        </div>
      </div>
    </footer>
  );
}
