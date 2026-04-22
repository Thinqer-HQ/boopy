import type { ParsedSubscriptionCandidate, ParserInput } from "@/lib/ingestion/types";

function detectCadence(text: string): "monthly" | "yearly" | "custom" {
  const normalized = text.toLowerCase();
  if (
    normalized.includes("yearly") ||
    normalized.includes("year ") ||
    normalized.includes("annual")
  ) {
    return "yearly";
  }
  if (normalized.includes("monthly") || normalized.includes("month ")) return "monthly";
  return "custom";
}

function detectCurrency(text: string): string {
  if (/\bEUR\b|€/.test(text)) return "EUR";
  if (/\bGBP\b|£/.test(text)) return "GBP";
  return "USD";
}

function parseLocalizedAmount(input: string): number | null {
  const value = input.trim();
  if (!value) return null;
  const commaIndex = value.lastIndexOf(",");
  const dotIndex = value.lastIndexOf(".");

  let normalized = value;
  if (commaIndex !== -1 && dotIndex !== -1) {
    if (dotIndex > commaIndex) {
      normalized = value.replaceAll(",", "");
    } else {
      normalized = value.replaceAll(".", "").replace(",", ".");
    }
  } else if (commaIndex !== -1) {
    const fractionLength = value.length - commaIndex - 1;
    normalized =
      fractionLength > 0 && fractionLength <= 2
        ? value.replace(",", ".")
        : value.replaceAll(",", "");
  } else if (dotIndex !== -1) {
    const fractionLength = value.length - dotIndex - 1;
    normalized = fractionLength > 0 && fractionLength <= 2 ? value : value.replaceAll(".", "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function detectAmount(text: string): number | null {
  const preferredMatches = [...text.matchAll(/(?:USD|EUR|GBP|\$|€|£)\s*([0-9][0-9.,]*)/gi)];
  for (const match of preferredMatches) {
    const parsed = parseLocalizedAmount(match[1] ?? "");
    if (parsed !== null) return parsed;
  }

  const genericMatches = [...text.matchAll(/\b([0-9][0-9.,]{1,})\b/g)];
  for (const match of genericMatches) {
    const parsed = parseLocalizedAmount(match[1] ?? "");
    if (parsed !== null) return parsed;
  }
  return null;
}

function detectDate(text: string): string | null {
  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (slashMatch) {
    const first = Number.parseInt(slashMatch[1], 10);
    const second = Number.parseInt(slashMatch[2], 10);
    const year = Number.parseInt(slashMatch[3], 10);
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

export function parseWithHeuristics(input: ParserInput): ParsedSubscriptionCandidate {
  const baseName = input.filename.split(".")[0] ?? "Unknown Vendor";
  const text = `${baseName}\n${input.textContent}`;
  const amount = detectAmount(text);
  const renewalDate = detectDate(text);
  const cadence = detectCadence(text);
  const confidenceSignals = [
    input.textContent.trim().length > 20,
    amount !== null,
    renewalDate !== null,
    cadence !== "custom",
  ].filter(Boolean).length;
  const confidence = Math.min(0.92, 0.35 + confidenceSignals * 0.16);

  return {
    vendorName: baseName.replace(/[_-]/g, " ").trim() || "Unknown Vendor",
    amount,
    currency: detectCurrency(text),
    cadence,
    renewalDate,
    confidence,
    rawPayload: {
      parser: "heuristic",
      preview: input.textContent.slice(0, 500),
    },
  };
}
