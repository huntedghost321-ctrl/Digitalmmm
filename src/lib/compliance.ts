// KDP Compliance Checker — basic version (MVP item 5):
// AI-disclosure flag + low-content-book warning, plus duplicate-section and
// title checks that commonly trip KDP review.

export interface ComplianceFlag {
  code: string;
  severity: "blocker" | "warning" | "info";
  title: string;
  detail: string;
}

export interface ComplianceResult {
  passed: boolean;
  flags: ComplianceFlag[];
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function runComplianceCheck(content: string, productType: string): ComplianceResult {
  const flags: ComplianceFlag[] = [];
  const words = wordCount(content);

  // KDP requires publishers to declare AI-generated content when publishing.
  flags.push({
    code: "kdp_ai_disclosure",
    severity: "info",
    title: "Declare AI-generated content on KDP",
    detail:
      "Amazon KDP requires you to declare AI-generated text, images or translations during title setup. This product was AI-generated, so answer 'yes' to the AI-generated content question when you publish. digitalmmm also embeds machine-readable AI-provenance metadata in every export.",
  });

  // Low-content risk: KDP treats books that are mostly blank/repetitive
  // (planners, journals, logs) under separate low-content rules.
  const blankFieldCount = (content.match(/_{3,}/g) ?? []).length;
  if (productType !== "ebook" && (words < 2500 || blankFieldCount > 40)) {
    flags.push({
      code: "kdp_low_content",
      severity: "warning",
      title: "Likely classed as a low-content book",
      detail:
        `This ${productType} has ${words.toLocaleString()} words and ${blankFieldCount} fill-in fields. KDP treats low-content books differently: no ISBN lookup, no expanded distribution, and stricter duplicate screening. Consider adding more instructional content per section, or publish it deliberately as low-content.`,
    });
  }

  if (productType === "ebook" && words < 4000) {
    flags.push({
      code: "kdp_short_ebook",
      severity: "warning",
      title: "Ebook is short for a paid listing",
      detail: `At ${words.toLocaleString()} words, buyers may flag this as thin content, which drives returns and review complaints. Aim for 6,000+ words or price accordingly.`,
    });
  }

  // Duplicate/near-duplicate sections — repeated blocks get books flagged at volume.
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 120);
  const seen = new Map<string, number>();
  for (const p of paragraphs) {
    seen.set(p, (seen.get(p) ?? 0) + 1);
  }
  const duplicates = [...seen.values()].filter((n) => n > 1).length;
  if (duplicates > 0) {
    flags.push({
      code: "duplicate_sections",
      severity: "blocker",
      title: `${duplicates} duplicated section${duplicates === 1 ? "" : "s"} found`,
      detail:
        "Identical paragraphs appear more than once. Marketplaces screen for duplicated content at volume — edit the repeated sections so each is distinct before exporting.",
    });
  }

  // Title checks
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] ?? "";
  if (!title) {
    flags.push({
      code: "missing_title",
      severity: "blocker",
      title: "No title found",
      detail: "The document has no level-1 heading. KDP requires a title that matches your listing.",
    });
  } else if (/free|best.?seller|#1/i.test(title)) {
    flags.push({
      code: "kdp_title_claims",
      severity: "warning",
      title: "Title contains restricted claims",
      detail: `KDP prohibits promotional claims like "free", "bestseller" or "#1" in titles. Current title: "${title}".`,
    });
  }

  const passed = !flags.some((f) => f.severity === "blocker");
  return { passed, flags };
}
