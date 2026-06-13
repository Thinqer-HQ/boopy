import * as XLSX from "xlsx";
import type { InvoiceDetails, InvoiceLineItem, InvoiceSummary } from "./types";

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPeriod(renewalDate: string, cadence: string): string {
  const d = new Date(renewalDate + "T00:00:00Z");
  const month = d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  if (cadence === "yearly") return `FY ${d.getUTCFullYear()}`;
  if (cadence === "quarterly") {
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    return `Q${q} ${d.getUTCFullYear()}`;
  }
  return month;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}

type RowData = (string | number | null)[];

export function generateInvoiceExcel(
  details: InvoiceDetails,
  lineItems: InvoiceLineItem[],
  summaries: InvoiceSummary[]
): void {
  const rows: RowData[] = [];
  const R = (cols: RowData) => rows.push(cols);
  const BLANK = () => rows.push([null, null, null, null, null, null, null, null]);

  const showMarkup = details.markupPercent > 0;

  // ── Header block ──────────────────────────────────────────────────────────
  R(["INVOICE", null, null, null, "Invoice #:", details.invoiceNumber || "—", null, null]);
  R([null, null, null, null, "Issue Date:", formatDate(details.issueDate), null, null]);
  R([null, null, null, null, "Due Date:", formatDate(details.dueDate), null, null]);
  if (details.poNumber.trim()) {
    R([null, null, null, null, "PO #:", details.poNumber, null, null]);
  }
  BLANK();

  // ── From / To ─────────────────────────────────────────────────────────────
  R(["FROM", null, null, null, "BILL TO", null, null, null]);
  R([details.fromName || "—", null, null, null, details.toName || "—", null, null, null]);
  if (details.fromAddress || details.toAddress) {
    R([details.fromAddress || null, null, null, null, details.toAddress || null, null, null, null]);
  }
  if (details.fromEmail || details.toEmail) {
    R([details.fromEmail || null, null, null, null, details.toEmail || null, null, null, null]);
  }
  if (details.fromPhone) {
    R([details.fromPhone, null, null, null, null, null, null, null]);
  }
  if (details.fromVatNumber) {
    R([`VAT: ${details.fromVatNumber}`, null, null, null, null, null, null, null]);
  }
  BLANK();

  // ── Group sections ────────────────────────────────────────────────────────
  const byGroup = new Map<string, { name: string; items: InvoiceLineItem[] }>();
  for (const item of lineItems) {
    if (!byGroup.has(item.groupId)) {
      byGroup.set(item.groupId, { name: item.groupName, items: [] });
    }
    byGroup.get(item.groupId)!.items.push(item);
  }

  for (const { name: groupName, items } of byGroup.values()) {
    // Group header
    R([`GROUP: ${groupName}`, null, null, null, null, null, null, null]);

    // Column headers
    if (showMarkup) {
      R([
        "Service",
        "Category",
        "Cycle",
        "Period",
        "Unit Cost",
        `Markup (${details.markupPercent}%)`,
        "Total",
        "Currency",
      ]);
    } else {
      R(["Service", "Category", "Cycle", "Period", "Amount", null, null, "Currency"]);
    }

    // Group by currency within group
    const byCurrency = new Map<string, InvoiceLineItem[]>();
    for (const item of items) {
      if (!byCurrency.has(item.currency)) byCurrency.set(item.currency, []);
      byCurrency.get(item.currency)!.push(item);
    }

    for (const [currency, currencyItems] of byCurrency.entries()) {
      for (const item of currencyItems) {
        if (showMarkup) {
          R([
            item.vendorName,
            item.category || null,
            item.cadence.charAt(0).toUpperCase() + item.cadence.slice(1),
            formatPeriod(item.renewalDate, item.cadence),
            item.unitAmount,
            item.markupAmount,
            item.totalAmount,
            currency,
          ]);
        } else {
          R([
            item.vendorName,
            item.category || null,
            item.cadence.charAt(0).toUpperCase() + item.cadence.slice(1),
            formatPeriod(item.renewalDate, item.cadence),
            item.unitAmount,
            null,
            null,
            currency,
          ]);
        }
      }

      // Currency subtotal within group
      const groupSubtotal = currencyItems.reduce((s, i) => s + i.totalAmount, 0);
      if (showMarkup) {
        R([null, null, null, null, null, "Subtotal", groupSubtotal, currency]);
      } else {
        R([null, null, null, null, "Subtotal", null, null, currency]);
        rows[rows.length - 1][4] = groupSubtotal;
      }
    }
    BLANK();
  }

  // ── Grand totals ──────────────────────────────────────────────────────────
  R(["TOTALS", null, null, null, null, null, null, null]);
  for (const s of summaries) {
    R([null, null, null, null, null, `${s.currency} Subtotal:`, s.subtotal, s.currency]);
    if (details.taxPercent > 0) {
      R([null, null, null, null, null, `Tax (${details.taxPercent}%):`, s.taxAmount, s.currency]);
    }
    R([null, null, null, null, null, `${s.currency} TOTAL:`, s.total, s.currency]);
  }
  BLANK();

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (details.notes.trim()) {
    R(["Notes:", details.notes, null, null, null, null, null, null]);
  }

  // ── Build worksheet ───────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths (in characters)
  ws["!cols"] = [
    { wch: 30 }, // A: Service / label
    { wch: 16 }, // B: Category
    { wch: 12 }, // C: Cycle
    { wch: 14 }, // D: Period
    { wch: 14 }, // E: Unit Cost / Amount
    { wch: 18 }, // F: Markup / Subtotal label
    { wch: 14 }, // G: Total / Amount
    { wch: 10 }, // H: Currency
  ];

  // Format numeric cells as currency-like numbers
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = 4; c <= 6; c++) {
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

  const invoiceNum = details.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "-") || "invoice";
  XLSX.writeFile(wb, `Invoice-${invoiceNum}.xlsx`);
}
