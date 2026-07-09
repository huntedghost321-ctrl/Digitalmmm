import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import { parseBlocks } from "../markdown";
import { AI_PROVENANCE, provenanceJson } from "../marking";

export interface DocxExportOptions {
  title: string;
  content: string;
  productId: string;
  watermark: boolean;
}

export async function buildDocx(opts: DocxExportOptions): Promise<Uint8Array> {
  const children: Paragraph[] = [];

  for (const block of parseBlocks(opts.content)) {
    switch (block.kind) {
      case "h1":
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 }));
        break;
      case "h2":
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 }));
        break;
      case "h3":
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_3 }));
        break;
      case "p":
        children.push(new Paragraph({ children: [new TextRun(block.text)], spacing: { after: 160 } }));
        break;
      case "bullet":
        children.push(new Paragraph({ text: block.text, bullet: { level: 0 } }));
        break;
      case "numbered":
        children.push(
          new Paragraph({ text: block.text, numbering: { reference: "num", level: 0 } })
        );
        break;
    }
  }

  if (opts.watermark) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [
          new TextRun({ text: "Made with digitalmmm — free plan", size: 16, color: "1F5F5B" }),
        ],
      })
    );
  }

  // Human-readable AI disclosure colophon; machine-readable marking below in
  // the document properties (EU AI Act Art. 50 baseline).
  children.push(
    new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: AI_PROVENANCE.statement, size: 14, color: "8FA998" })],
    })
  );

  const doc = new Document({
    title: opts.title,
    creator: AI_PROVENANCE.generator,
    description: AI_PROVENANCE.statement + " " + provenanceJson(opts.productId, new Date()),
    keywords: AI_PROVENANCE.keywords.join(", "),
    numbering: {
      config: [
        {
          reference: "num",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: "Georgia", size: 22 } },
        heading1: { run: { font: "Georgia", size: 48, bold: true, color: "1B222C" } },
        heading2: { run: { font: "Georgia", size: 32, bold: true, color: "1F5F5B" } },
        heading3: { run: { font: "Georgia", size: 26, bold: true, color: "1B222C" } },
      },
    },
    sections: [{ children }],
  });

  const blob = await Packer.toBuffer(doc);
  return new Uint8Array(blob);
}
