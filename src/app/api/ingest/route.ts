import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { extractPdfText, extractUrlText } from "@/lib/ingest";

export const maxDuration = 60;

const MAX_PDF_BYTES = 20 * 1024 * 1024;

// Create Source: turns a URL or an uploaded PDF into clean text that feeds the
// generators. Topic input needs no ingestion and goes straight to /api/generate.
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const { url } = await req.json();
      if (typeof url !== "string") return jsonError(400, "bad_request", "Provide a url.");
      const { text, title } = await extractUrlText(url);
      return NextResponse.json({ text, title });
    }

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return jsonError(400, "bad_request", "Attach a PDF file.");
      if (file.size > MAX_PDF_BYTES) return jsonError(413, "too_large", "PDFs up to 20 MB are supported.");
      // Validate by magic bytes, not just the filename (PRD 9A: upload validation)
      const buffer = await file.arrayBuffer();
      const head = new TextDecoder().decode(new Uint8Array(buffer.slice(0, 5)));
      if (head !== "%PDF-") return jsonError(415, "not_a_pdf", "That file is not a PDF.");
      const text = await extractPdfText(buffer);
      if (text.trim().length < 200) {
        return jsonError(422, "not_enough_text", "We couldn't extract enough text from that PDF (scanned/image-only PDFs aren't supported yet).");
      }
      return NextResponse.json({ text, title: file.name.replace(/\.pdf$/i, "") });
    }

    return jsonError(415, "unsupported", "Send JSON with a url, or multipart form-data with a PDF file.");
  } catch (e) {
    const code = e instanceof Error ? e.message : "ingest_failed";
    const messages: Record<string, string> = {
      invalid_url: "That doesn't look like a valid http(s) URL.",
      blocked_host: "That host can't be fetched.",
      fetch_failed: "We couldn't fetch that page.",
      unsupported_content_type: "That URL doesn't point to a readable page.",
      not_enough_text: "We couldn't extract enough text from that source.",
    };
    return jsonError(422, code, messages[code] ?? "We couldn't read that source. Try a different one.");
  }
}
