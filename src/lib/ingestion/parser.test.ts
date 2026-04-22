import { describe, expect, it } from "vitest";

import { parseDocumentCandidate } from "@/lib/ingestion/parser";

describe("document parser", () => {
  it("extracts a candidate with sane defaults", async () => {
    const result = await parseDocumentCandidate({
      filename: "notion-invoice.txt",
      mimeType: "text/plain",
      textContent: "Monthly plan USD 12.99 renews 2026-06-01",
    });

    expect(result.provider).toBe("heuristic");
    expect(result.candidate.vendorName).toContain("notion");
    expect(result.candidate.amount).toBe(12.99);
    expect(result.candidate.renewalDate).toBe("2026-06-01");
  });

  it("parses annual invoices with US-style dates and thousand separators", async () => {
    const result = await parseDocumentCandidate({
      filename: "aws-annual-invoice.pdf",
      mimeType: "application/pdf",
      textContent: "Annual plan total USD 1,299.50 next renewal 06/01/2027",
    });

    expect(result.candidate.cadence).toBe("yearly");
    expect(result.candidate.amount).toBe(1299.5);
    expect(result.candidate.renewalDate).toBe("2027-06-01");
  });

  it("keeps custom cadence but still parses DD/MM/YYYY dates", async () => {
    const result = await parseDocumentCandidate({
      filename: "custom-retainer.txt",
      mimeType: "text/plain",
      textContent: "Retainer invoice amount EUR 89,90 due 15/09/2026",
    });

    expect(result.candidate.cadence).toBe("custom");
    expect(result.candidate.amount).toBe(89.9);
    expect(result.candidate.currency).toBe("EUR");
    expect(result.candidate.renewalDate).toBe("2026-09-15");
  });
});
