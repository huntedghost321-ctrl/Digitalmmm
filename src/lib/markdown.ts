// Minimal block-level Markdown model shared by the PDF and DOCX exporters and
// the in-app preview. Only the constructs the generators emit.

export type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "numbered"; text: string; n: number };

export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const bullet = line.match(/^[-*]\s+(.*)/);
    const numbered = line.match(/^(\d+)[.)]\s+(.*)/);

    if (!line.trim()) {
      flush();
    } else if (h1) {
      flush();
      blocks.push({ kind: "h1", text: clean(h1[1]) });
    } else if (h2) {
      flush();
      blocks.push({ kind: "h2", text: clean(h2[1]) });
    } else if (h3) {
      flush();
      blocks.push({ kind: "h3", text: clean(h3[1]) });
    } else if (bullet) {
      flush();
      blocks.push({ kind: "bullet", text: clean(bullet[1]) });
    } else if (numbered) {
      flush();
      blocks.push({ kind: "numbered", text: clean(numbered[2]), n: parseInt(numbered[1], 10) });
    } else {
      paragraph.push(clean(line));
    }
  }
  flush();
  return blocks;
}

// Strip inline markdown we don't render (bold/italic markers).
function clean(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`(.*?)`/g, "$1").trim();
}
