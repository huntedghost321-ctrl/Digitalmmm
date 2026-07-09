import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { parseBlocks } from "../markdown";
import { COVER_PALETTES, wrapTitle, type CoverSpec } from "../cover";
import { AI_PROVENANCE, provenanceJson } from "../marking";

const PAGE_W = 432; // 6in
const PAGE_H = 648; // 9in — standard trade book size
const MARGIN = 54;
const BODY_W = PAGE_W - MARGIN * 2;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface PdfExportOptions {
  title: string;
  content: string;
  cover: CoverSpec | null;
  productId: string;
  watermark: boolean; // free plan exports carry a small watermark
}

export async function buildPdf(opts: PdfExportOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  // Machine-readable AI-provenance marking (EU AI Act Art. 50 baseline)
  doc.setTitle(opts.title);
  doc.setProducer(AI_PROVENANCE.generator);
  doc.setCreator(AI_PROVENANCE.generator);
  doc.setSubject(AI_PROVENANCE.statement + " " + provenanceJson(opts.productId, new Date()));
  doc.setKeywords([...AI_PROVENANCE.keywords]);

  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);

  // --- Cover page (vector-rendered from the same spec as the SVG preview) ---
  if (opts.cover) {
    const p = COVER_PALETTES[opts.cover.paletteIndex];
    const page = doc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: hexToRgb(p.bg) });

    if (opts.cover.layout === "band") {
      page.drawRectangle({ x: 0, y: PAGE_H - 100, width: PAGE_W, height: 10, color: hexToRgb(p.band) });
      page.drawRectangle({ x: 0, y: 90, width: PAGE_W, height: 10, color: hexToRgb(p.band) });
    } else if (opts.cover.layout === "frame") {
      page.drawRectangle({
        x: 26, y: 26, width: PAGE_W - 52, height: PAGE_H - 52,
        borderColor: hexToRgb(p.band), borderWidth: 2.5,
      });
      page.drawRectangle({
        x: 34, y: 34, width: PAGE_W - 68, height: PAGE_H - 68,
        borderColor: hexToRgb(p.accent), borderWidth: 0.8,
      });
    } else {
      page.drawRectangle({ x: 0, y: PAGE_H - 130, width: PAGE_W, height: 130, color: hexToRgb(p.band) });
    }

    const lines = wrapTitle(opts.cover.title);
    const size = lines.some((l) => l.length > 13) ? 34 : 42;
    let y = PAGE_H - 250;
    for (const line of lines) {
      const w = serifBold.widthOfTextAtSize(line, size);
      page.drawText(line, { x: (PAGE_W - w) / 2, y, size, font: serifBold, color: hexToRgb(p.text) });
      y -= size + 8;
    }
    if (opts.cover.subtitle) {
      const sub = opts.cover.subtitle.toUpperCase();
      const w = sans.widthOfTextAtSize(sub, 12);
      page.drawText(sub, { x: (PAGE_W - w) / 2, y: y - 12, size: 12, font: sans, color: hexToRgb(p.accent) });
    }
    const author = opts.cover.author;
    const aw = sans.widthOfTextAtSize(author, 12);
    page.drawText(author, { x: (PAGE_W - aw) / 2, y: 60, size: 12, font: sans, color: hexToRgb(p.text) });
  }

  // --- Body ---
  const ink = hexToRgb("#1B222C");
  const teal = hexToRgb("#1F5F5B");
  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  let pageNo = 1;

  const footer = (pg: PDFPage, n: number) => {
    pg.drawText(String(n), { x: PAGE_W / 2 - 4, y: 28, size: 9, font: sans, color: ink, opacity: 0.6 });
    if (opts.watermark) {
      pg.drawText("Made with digitalmmm — free plan", {
        x: MARGIN, y: 28, size: 8, font: sans, color: teal, opacity: 0.7,
      });
    }
  };
  footer(page, pageNo);

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    pageNo += 1;
    footer(page, pageNo);
    y = PAGE_H - MARGIN;
  };

  const draw = (
    text: string,
    font: PDFFont,
    size: number,
    opts2: { color?: ReturnType<typeof rgb>; indent?: number; spaceAfter?: number; prefix?: string } = {}
  ) => {
    const indent = opts2.indent ?? 0;
    const lines = wrapText(text, font, size, BODY_W - indent);
    const lineHeight = size * 1.45;
    for (let i = 0; i < lines.length; i++) {
      if (y < MARGIN + 20) newPage();
      const prefix = i === 0 && opts2.prefix ? opts2.prefix : "";
      if (prefix) {
        page.drawText(prefix, { x: MARGIN, y, size, font, color: opts2.color ?? ink });
      }
      page.drawText(lines[i], { x: MARGIN + indent, y, size, font, color: opts2.color ?? ink });
      y -= lineHeight;
    }
    y -= opts2.spaceAfter ?? size * 0.5;
  };

  for (const block of parseBlocks(opts.content)) {
    switch (block.kind) {
      case "h1":
        if (y < PAGE_H - MARGIN - 10) newPage();
        draw(block.text, serifBold, 24, { spaceAfter: 18 });
        break;
      case "h2":
        if (y < MARGIN + 120) newPage();
        y -= 10;
        draw(block.text, serifBold, 16, { color: teal, spaceAfter: 10 });
        break;
      case "h3":
        draw(block.text, serifBold, 13, { spaceAfter: 6 });
        break;
      case "p":
        draw(block.text, serif, 11, { spaceAfter: 8 });
        break;
      case "bullet":
        draw(block.text, serif, 11, { indent: 16, prefix: "•", spaceAfter: 3 });
        break;
      case "numbered":
        draw(block.text, serif, 11, { indent: 20, prefix: `${block.n}.`, spaceAfter: 3 });
        break;
    }
  }

  // Colophon — human-readable AI disclosure alongside the metadata marking
  y -= 20;
  if (y < MARGIN + 40) newPage();
  draw(AI_PROVENANCE.statement, sans, 8, { color: teal, spaceAfter: 0 });

  return doc.save();
}
