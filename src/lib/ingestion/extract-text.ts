import { PDFParse } from "pdf-parse";

type ExtractTextInput = {
  filename: string;
  mimeType: string;
  blob: Blob;
};

export type ExtractTextResult = {
  textContent: string;
  extractor: "text" | "pdf" | "none";
};

export async function extractDocumentText(input: ExtractTextInput): Promise<ExtractTextResult> {
  const mime = input.mimeType.toLowerCase();
  if (mime.startsWith("text/") || mime.includes("json") || mime.includes("xml")) {
    return {
      textContent: await input.blob.text(),
      extractor: "text",
    };
  }

  const extension = input.filename.split(".").pop()?.toLowerCase();
  const isPdf = mime === "application/pdf" || extension === "pdf";
  if (isPdf) {
    const bytes = await input.blob.arrayBuffer();
    const parser = new PDFParse({ data: Buffer.from(bytes) });
    const parsed = await parser.getText().finally(async () => {
      await parser.destroy();
    });
    return {
      textContent: parsed.text ?? "",
      extractor: "pdf",
    };
  }

  // For binary/image-only uploads without OCR configured, we still allow candidate
  // creation from filename heuristics rather than failing hard.
  return {
    textContent: "",
    extractor: "none",
  };
}
