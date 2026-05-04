import { extractDocumentText } from "@/lib/ingestion/extract-text";
import { normalizeExtractedSubscriptionFields } from "@/lib/ingestion/normalize-extracted-subscription";
import { parseWithHeuristics } from "@/lib/ingestion/providers/heuristic";
import type {
  ExtractSubscriptionFromFileResult,
  ExtractedSubscriptionFields,
} from "@/lib/ingestion/subscription-extract-types";
import { extractSubscriptionWithVision } from "@/lib/ingestion/vision-extract-subscription";

const MAX_BYTES = 6 * 1024 * 1024;

function isProbablyImage(mimeType: string, filename: string): boolean {
  const m = mimeType.toLowerCase();
  if (/^image\/(png|jpe?g|webp)$/i.test(m)) return true;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp";
}

function heuristicToFields(
  filename: string,
  mimeType: string,
  textContent: string
): ExtractedSubscriptionFields {
  const parsed = parseWithHeuristics({ filename, mimeType, textContent });
  return normalizeExtractedSubscriptionFields({
    vendorName: parsed.vendorName,
    amount: parsed.amount,
    currency: parsed.currency,
    cadence: parsed.cadence,
    renewalDate: parsed.renewalDate,
    startDate: null,
    endDate: null,
    category: null,
    notes: null,
  });
}

export function assertExtractableFileSize(sizeBytes: number) {
  if (sizeBytes > MAX_BYTES) {
    throw new Error(`File is too large (max ${Math.floor(MAX_BYTES / (1024 * 1024))}MB).`);
  }
}

/**
 * Extract subscription-like fields from an uploaded file (PDF, text, or image).
 * Images use OpenAI vision when `OPENAI_API_KEY` is set; otherwise falls back to filename heuristics with a hint.
 */
export async function extractSubscriptionFromFile(args: {
  filename: string;
  mimeType: string;
  blob: Blob;
}): Promise<ExtractSubscriptionFromFileResult> {
  assertExtractableFileSize(args.blob.size);

  const hints: string[] = [];
  const mime = args.mimeType || "application/octet-stream";

  if (isProbablyImage(mime, args.filename)) {
    const openaiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
    if (!openaiConfigured) {
      const fields = heuristicToFields(args.filename, mime, "");
      hints.push(
        "Screenshot or photo: set OPENAI_API_KEY on the server to read text from images. PDFs and plain-text invoices work with rules-only parsing."
      );
      return {
        source: "heuristic",
        confidence: Math.min(0.45, fields.vendorName ? 0.4 : 0.25),
        fields,
        hints,
      };
    }

    const buf = await args.blob.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mimeForData = /^image\//i.test(mime) ? mime : "image/png";
    const dataUrl = `data:${mimeForData};base64,${base64}`;
    return extractSubscriptionWithVision({ dataUrl, filename: args.filename });
  }

  const extracted = await extractDocumentText({
    filename: args.filename,
    mimeType: mime,
    blob: args.blob,
  });

  if (extracted.extractor === "none" && !extracted.textContent.trim()) {
    hints.push(
      "No extractable text in this file. Try PDF, a text export, or a clearer screenshot with AI enabled."
    );
  }

  const fields = heuristicToFields(args.filename, mime, extracted.textContent);
  const confidenceSignals = [
    extracted.textContent.trim().length > 40,
    fields.amount != null,
    fields.renewalDate != null,
    fields.vendorName != null && fields.vendorName.length > 2,
  ].filter(Boolean).length;

  const confidence = Math.min(0.9, 0.38 + confidenceSignals * 0.14);

  return {
    source: "heuristic",
    confidence,
    fields,
    hints,
  };
}
