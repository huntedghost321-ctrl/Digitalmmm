// EU AI Act Article 50 baseline (MVP item 15): machine-readable marking that
// exported content is AI-generated, embedded in the metadata of every export.
// This is the MVP-scope marking; full C2PA content credentials are the Phase 2
// upgrade path once raster image/audio/video output ships (see docs/compliance).

export const AI_PROVENANCE = {
  generator: "digitalmmm",
  statement: "AI-generated content. Created with digitalmmm (https://digitalmmm.com).",
  keywords: ["AI-generated", "digitalmmm", "EU-AI-Act-Article-50"],
} as const;

export function provenanceJson(productId: string, exportedAt: Date): string {
  return JSON.stringify({
    generator: AI_PROVENANCE.generator,
    aiGenerated: true,
    standardRef: "EU AI Act, Article 50 (transparency)",
    productId,
    exportedAt: exportedAt.toISOString(),
  });
}
