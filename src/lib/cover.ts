// AI Image Maker — covers only in MVP (item 4).
// A cover is stored as a compact spec (palette + layout + type treatment), then
// rendered twice from the same spec: as SVG for on-screen preview and as vector
// drawing commands in the PDF export. This keeps covers crisp at any size and
// avoids shipping raster files in MVP. A raster image-gen provider can be
// plugged in behind the same spec later.

export interface CoverSpec {
  title: string;
  subtitle: string;
  author: string;
  paletteIndex: number;
  layout: "band" | "frame" | "split";
  aiGenerated: true; // provenance flag — carried into export metadata (EU AI Act Art. 50)
}

// Brand-adjacent palettes derived from the digitalmmm tokens.
export const COVER_PALETTES = [
  { bg: "#1F5F5B", band: "#D9A441", text: "#F6F5F0", accent: "#8FA998" },
  { bg: "#1B222C", band: "#1F5F5B", text: "#F6F5F0", accent: "#D9A441" },
  { bg: "#F6F5F0", band: "#1F5F5B", text: "#1B222C", accent: "#D9A441" },
  { bg: "#8FA998", band: "#1B222C", text: "#1B222C", accent: "#F6F5F0" },
  { bg: "#D9A441", band: "#1B222C", text: "#1B222C", accent: "#1F5F5B" },
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildCoverSpec(
  title: string,
  productType: string,
  authorEmail: string,
  variant = 0
): CoverSpec {
  const layouts: CoverSpec["layout"][] = ["band", "frame", "split"];
  const h = hashString(title + variant);
  const subtitleByType: Record<string, string> = {
    ebook: "A practical guide",
    workbook: "Exercises & worksheets",
    planner: "Plan it. Track it. Finish it.",
  };
  return {
    title,
    subtitle: subtitleByType[productType] ?? "",
    author: authorEmail.split("@")[0].replace(/[._-]+/g, " "),
    paletteIndex: h % COVER_PALETTES.length,
    layout: layouts[(h >> 3) % layouts.length],
    aiGenerated: true,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Split a title into balanced lines of <= maxChars.
export function wrapTitle(title: string, maxChars = 16): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

// 2:3 book cover, 600x900 viewbox.
export function renderCoverSvg(spec: CoverSpec): string {
  const p = COVER_PALETTES[spec.paletteIndex];
  const lines = wrapTitle(spec.title);
  const titleSize = lines.some((l) => l.length > 13) ? 52 : 62;
  const titleBlock = lines
    .map(
      (l, i) =>
        `<text x="300" y="${330 + i * (titleSize + 10)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${titleSize}" fill="${p.text}">${escapeXml(l)}</text>`
    )
    .join("\n");

  const deco =
    spec.layout === "band"
      ? `<rect x="0" y="120" width="600" height="14" fill="${p.band}"/>
         <rect x="0" y="770" width="600" height="14" fill="${p.band}"/>`
      : spec.layout === "frame"
        ? `<rect x="36" y="36" width="528" height="828" fill="none" stroke="${p.band}" stroke-width="3"/>
           <rect x="48" y="48" width="504" height="804" fill="none" stroke="${p.accent}" stroke-width="1"/>`
        : `<path d="M0 0 L600 0 L600 170 Q300 230 0 170 Z" fill="${p.band}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" role="img" aria-label="Book cover: ${escapeXml(spec.title)}">
  <rect width="600" height="900" fill="${p.bg}"/>
  ${deco}
  ${titleBlock}
  <text x="300" y="${360 + lines.length * (titleSize + 10)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="3" fill="${p.accent}">${escapeXml(spec.subtitle.toUpperCase())}</text>
  <text x="300" y="840" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="${p.text}">${escapeXml(spec.author)}</text>
</svg>`;
}
