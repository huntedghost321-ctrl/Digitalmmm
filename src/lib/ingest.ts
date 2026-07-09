import { extractText, getDocumentProxy } from "unpdf";

// Create Source — MVP scope: PDF + website URL + plain topic (item 2).

const MAX_SOURCE_CHARS = 120_000;

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return String(text).slice(0, MAX_SOURCE_CHARS);
}

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^169\.254\./.test(h) ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.startsWith("[")
  );
}

// Fetch a public URL and strip it to readable text. Guards against SSRF by
// refusing non-http(s) schemes and private/loopback hosts (PRD 9A).
export async function extractUrlText(rawUrl: string): Promise<{ text: string; title: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("invalid_url");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid_url");
  if (isPrivateHost(url.hostname)) throw new Error("blocked_host");

  const res = await fetch(url.toString(), {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { "user-agent": "digitalmmm-source-fetcher/1.0" },
  });
  if (!res.ok) throw new Error("fetch_failed");
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error("unsupported_content_type");
  }

  const html = (await res.text()).slice(0, 2_000_000);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_SOURCE_CHARS);

  if (text.length < 200) throw new Error("not_enough_text");
  return { text, title: titleMatch?.[1]?.trim() ?? url.hostname };
}
