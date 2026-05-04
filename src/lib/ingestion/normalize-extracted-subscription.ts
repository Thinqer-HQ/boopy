import { parseRenewalYmd } from "@/lib/subscriptions/recurrence";

import type { ExtractedSubscriptionFields } from "@/lib/ingestion/subscription-extract-types";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeYmd(value: string | null | undefined): string | null {
  const t = value?.trim();
  if (!t || !YMD.test(t)) return null;
  return parseRenewalYmd(t) ? t : null;
}

function sanitizeCurrency(value: string | null | undefined): string | null {
  const t = value?.trim().toUpperCase();
  if (!t || t.length < 3) return null;
  return t.slice(0, 8);
}

function sanitizeCadence(value: string | null | undefined): ExtractedSubscriptionFields["cadence"] {
  const v = value?.trim().toLowerCase();
  if (v === "monthly" || v === "yearly" || v === "quarterly" || v === "custom") return v;
  return null;
}

export function normalizeExtractedSubscriptionFields(
  raw: Partial<ExtractedSubscriptionFields>
): ExtractedSubscriptionFields {
  const amount =
    raw.amount != null && Number.isFinite(raw.amount) && raw.amount >= 0 ? raw.amount : null;

  return {
    vendorName: raw.vendorName?.trim() || null,
    amount,
    currency: sanitizeCurrency(raw.currency ?? null),
    cadence: sanitizeCadence(raw.cadence ?? null),
    renewalDate: sanitizeYmd(raw.renewalDate ?? null),
    startDate: sanitizeYmd(raw.startDate ?? null),
    endDate: sanitizeYmd(raw.endDate ?? null),
    category: raw.category?.trim() || null,
    notes: raw.notes?.trim() || null,
  };
}
