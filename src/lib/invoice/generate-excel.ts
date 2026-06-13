import * as XLSX from "xlsx";

import { billingMonths, formatBillingPeriod } from "./types";
import type { InvoiceDetails, InvoiceLineItem, InvoiceSummary } from "./types";

function fmtDate(d: string): string {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return d;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Row = (string | number | null)[];
const BLANK: Row = Array(9).fill(null);

export function generateInvoiceExcel(
  details: InvoiceDetails,
  lineItems: InvoiceLineItem[],
  summaries: InvoiceSummary[]
): void {
  const rows: Row[] = [];
  const R = (r: Row) => rows.push(r);

  const showMarkup = details.markupPercent > 0;
  const qty =
    details.billingFrom && details.billingTo
      ? billingMonths(details.billingFrom, details.billingTo)
      : 1;
  const showQty = qty !== 1;

  // ── Header ─────────────────────────────────────────────────────────────────
  R(["INVOICE", null, null, null, null, "Invoice #:", details.invoiceNumber || "—", null, null]);
  R([null, null, null, null, null, "Issue Date:", fmtDate(details.issueDate), null, null]);
  R([null, null, null, null, null, "Due Date:", fmtDate(details.dueDate), null, null]);
  if (details.billingFrom && details.billingTo) {
    R([
      null,
      null,
      null,
      null,
      null,
      "Billing Period:",
      formatBillingPeriod(details.billingFrom, details.billingTo),
      null,
      null,
    ]);
  }
  if (details.poNumber.trim()) {
    R([null, null, null, null, null, "PO #:", details.poNumber, null, null]);
  }
  R(BLANK);

  // ── From / To ──────────────────────────────────────────────────────────────
  R(["FROM", null, null, null, "BILL TO", null, null, null, null]);
  R([details.fromName || "—", null, null, null, details.toName || "—", null, null, null, null]);
  if (details.fromAddress || details.toAddress) {
    R([
      details.fromAddress || null,
      null,
      null,
      null,
      details.toAddress || null,
      null,
      null,
      null,
      null,
    ]);
  }
  if (details.fromEmail || details.toEmail) {
    R([
      details.fromEmail || null,
      null,
      null,
      null,
      details.toEmail || null,
      null,
      null,
      null,
      null,
    ]);
  }
  if (details.fromPhone) R([details.fromPhone, null, null, null, null, null, null, null, null]);
  if (details.fromVatNumber)
    R([`VAT: ${details.fromVatNumber}`, null, null, null, null, null, null, null, null]);
  R(BLANK);

  // ── Groups ─────────────────────────────────────────────────────────────────
  const byGroup = new Map<string, { name: string; items: InvoiceLineItem[] }>();
  for (const item of lineItems) {
    if (!byGroup.has(item.groupId)) byGroup.set(item.groupId, { name: item.groupName, items: [] });
    byGroup.get(item.groupId)!.items.push(item);
  }

  for (const { name: groupName, items } of byGroup.values()) {
    R([`CLIENT: ${groupName}`, null, null, null, null, null, null, null, null]);

    // Dynamic column headers
    const headers: Row = ["Service", "Category", "Cycle"];
    if (showQty) headers.push("Qty (mo)");
    headers.push("Unit/mo");
    if (showMarkup) headers.push(`Markup (${details.markupPercent}%)`);
    headers.push("Total", "Currency");
    while (headers.length < 9) headers.push(null);
    R(headers);

    const byCurrency = new Map<string, InvoiceLineItem[]>();
    for (const item of items) {
      if (!byCurrency.has(item.currency)) byCurrency.set(item.currency, []);
      byCurrency.get(item.currency)!.push(item);
    }

    for (const [currency, currItems] of byCurrency.entries()) {
      for (const item of currItems) {
        const row: Row = [item.vendorName, item.category || null, capitalize(item.cadence)];
        if (showQty) row.push(item.quantity);
        row.push(item.unitAmount);
        if (showMarkup) row.push(item.markupAmount);
        row.push(item.lineTotal, currency);
        while (row.length < 9) row.push(null);
        R(row);
      }
      // Currency subtotal
      const groupSubtotal = currItems.reduce((s, i) => s + i.lineTotal, 0);
      const subtotalRow: Row = Array(9).fill(null);
      subtotalRow[5] = `Subtotal (${currency})`;
      subtotalRow[6] = groupSubtotal;
      subtotalRow[7] = currency;
      R(subtotalRow);
    }
    R(BLANK);
  }

  // ── Grand totals ───────────────────────────────────────────────────────────
  R(["TOTALS", null, null, null, null, null, null, null, null]);
  for (const s of summaries) {
    R([null, null, null, null, null, `${s.currency} Subtotal:`, s.subtotal, s.currency, null]);
    if (details.taxPercent > 0) {
      R([
        null,
        null,
        null,
        null,
        null,
        `Tax (${details.taxPercent}%):`,
        s.taxAmount,
        s.currency,
        null,
      ]);
    }
    R([null, null, null, null, null, `${s.currency} TOTAL:`, s.total, s.currency, null]);
  }
  R(BLANK);

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (details.notes.trim()) {
    R(["Notes:", details.notes, null, null, null, null, null, null, null]);
  }

  // ── Build worksheet ────────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 32 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 10 },
    { wch: 4 },
  ];

  // Format numeric cells in columns D–G (index 3–6)
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = 3; c <= 6; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (cell && typeof cell.v === "number") {
        cell.t = "n";
        cell.z = "#,##0.00";
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");

  const safe = (details.invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-_]/g, "-");
  XLSX.writeFile(wb, `Invoice-${safe}.xlsx`);
}
