export type InvoiceLineItem = {
  id: string;
  groupId: string;
  groupName: string;
  vendorName: string;
  category: string | null;
  cadence: string;
  renewalDate: string;
  /** Monthly-normalised unit price (before markup) */
  unitAmount: number;
  currency: string;
  markupPercent: number;
  markupAmount: number;
  /** unitAmount + markupAmount */
  unitTotal: number;
  /** Number of billing periods (months) in the invoice period */
  quantity: number;
  /** unitTotal × quantity */
  lineTotal: number;
};

export type InvoiceDetails = {
  // Issuer (agency)
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  fromVatNumber: string;
  // Recipient (client)
  toName: string;
  toAddress: string;
  toEmail: string;
  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  /** YYYY-MM-DD start of billing period */
  billingFrom: string;
  /** YYYY-MM-DD end of billing period (inclusive) */
  billingTo: string;
  poNumber: string;
  // Pricing
  markupPercent: number;
  taxPercent: number;
  // Notes
  notes: string;
};

export type InvoiceSummary = {
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
};

/** Returns the number of months (can be fractional) between two YYYY-MM-DD strings. */
export function billingMonths(from: string, to: string): number {
  if (!from || !to) return 1;
  const f = new Date(from + "T00:00:00Z");
  const t = new Date(to + "T00:00:00Z");
  if (t <= f) return 1;
  const years = t.getUTCFullYear() - f.getUTCFullYear();
  const months = t.getUTCMonth() - f.getUTCMonth();
  // +1 because end date is inclusive (e.g. Jun 1–Jun 30 = 1 month, not 0.97)
  const days = t.getUTCDate() - f.getUTCDate() + 1;
  const raw = years * 12 + months + days / 30.4375;
  // Round to 4 decimal places to avoid floating point noise
  return Math.max(0, Math.round(raw * 10000) / 10000);
}

/** Format a billing period range for display, e.g. "Jun 1 – Jun 30, 2026" */
export function formatBillingPeriod(from: string, to: string): string {
  if (!from || !to) return "";
  const f = new Date(from + "T00:00:00Z");
  const t = new Date(to + "T00:00:00Z");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
  const fStr = f.toLocaleDateString("en-US", opts);
  const tStr = t.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${fStr} – ${tStr}`;
}
