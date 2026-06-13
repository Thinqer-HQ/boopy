import type React from "react";

import { billingMonths, formatBillingPeriod } from "@/lib/invoice/types";
import type { InvoiceDetails, InvoiceLineItem, InvoiceSummary } from "@/lib/invoice/types";

function fmtDate(d: string) {
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

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function fmtQty(qty: number) {
  if (Number.isInteger(qty)) return String(qty);
  return qty.toFixed(2);
}

type Props = {
  details: InvoiceDetails;
  lineItems: InvoiceLineItem[];
  summaries: InvoiceSummary[];
};

// A4 at 96dpi = 794×1123 px. We use this as the reference size.
// The component renders at natural width and is scaled by the parent.
export function InvoiceDocument({ details, lineItems, summaries }: Props) {
  const showMarkup = details.markupPercent > 0;
  const showQty = (() => {
    const m = billingMonthsFromDetails(details);
    return m !== 1;
  })();

  const byGroup = (() => {
    const map = new Map<string, { name: string; items: InvoiceLineItem[] }>();
    for (const item of lineItems) {
      if (!map.has(item.groupId)) map.set(item.groupId, { name: item.groupName, items: [] });
      map.get(item.groupId)!.items.push(item);
    }
    return [...map.values()];
  })();

  const billingPeriod = formatBillingPeriod(details.billingFrom, details.billingTo);

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        background: "#ffffff",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontSize: 11,
        color: "#111827",
        padding: "48px 56px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          height: 4,
          background: "#6d5df6",
          borderRadius: 2,
          marginBottom: 36,
        }}
      />

      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6d5df6", letterSpacing: -0.5 }}>
            INVOICE
          </div>
          {billingPeriod && (
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
              Billing period: {billingPeriod}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#374151" }}>
          <div style={{ display: "flex", gap: 24, justifyContent: "flex-end" }}>
            <div style={{ color: "#6b7280" }}>Invoice #</div>
            <div style={{ fontWeight: 600 }}>{details.invoiceNumber || "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{ color: "#6b7280" }}>Issue date</div>
            <div style={{ fontWeight: 600 }}>{fmtDate(details.issueDate) || "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{ color: "#6b7280" }}>Due date</div>
            <div style={{ fontWeight: 600 }}>{fmtDate(details.dueDate) || "—"}</div>
          </div>
          {details.poNumber && (
            <div style={{ display: "flex", gap: 24, justifyContent: "flex-end", marginTop: 4 }}>
              <div style={{ color: "#6b7280" }}>PO #</div>
              <div style={{ fontWeight: 600 }}>{details.poNumber}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── From / To ── */}
      <div style={{ display: "flex", gap: 40, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#6d5df6",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            From
          </div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{details.fromName || "—"}</div>
          {details.fromAddress && (
            <div
              style={{ color: "#4b5563", marginTop: 3, whiteSpace: "pre-wrap", lineHeight: 1.5 }}
            >
              {details.fromAddress}
            </div>
          )}
          {details.fromEmail && (
            <div style={{ color: "#4b5563", marginTop: 3 }}>{details.fromEmail}</div>
          )}
          {details.fromPhone && (
            <div style={{ color: "#4b5563", marginTop: 2 }}>{details.fromPhone}</div>
          )}
          {details.fromVatNumber && (
            <div style={{ color: "#4b5563", marginTop: 2 }}>VAT: {details.fromVatNumber}</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Bill To
          </div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{details.toName || "—"}</div>
          {details.toAddress && (
            <div
              style={{ color: "#4b5563", marginTop: 3, whiteSpace: "pre-wrap", lineHeight: 1.5 }}
            >
              {details.toAddress}
            </div>
          )}
          {details.toEmail && (
            <div style={{ color: "#4b5563", marginTop: 3 }}>{details.toEmail}</div>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 24 }} />

      {/* ── Line items by group ── */}
      {byGroup.map(({ name, items }) => {
        const byCurrency = new Map<string, InvoiceLineItem[]>();
        for (const item of items) {
          if (!byCurrency.has(item.currency)) byCurrency.set(item.currency, []);
          byCurrency.get(item.currency)!.push(item);
        }

        return (
          <div key={name} style={{ marginBottom: 20 }}>
            {/* Group header */}
            <div
              style={{
                background: "#f3f0ff",
                padding: "5px 10px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 10,
                color: "#4c3fbb",
                marginBottom: 0,
              }}
            >
              {name}
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle("left", "48%")}>Service</th>
                  {showQty && <th style={thStyle("right", "8%")}>Qty</th>}
                  <th style={thStyle("right", showQty ? "14%" : "20%")}>Unit price</th>
                  {showMarkup && <th style={thStyle("right", "12%")}>Markup</th>}
                  <th style={thStyle("right", showMarkup ? "14%" : "20%")}>Total</th>
                  <th style={thStyle("left", "8%")}>Cur.</th>
                </tr>
              </thead>
              <tbody>
                {[...byCurrency.entries()].flatMap(([currency, currItems]) =>
                  currItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        background: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                      }}
                    >
                      <td style={tdStyle("left")}>
                        <div style={{ fontWeight: 500 }}>{item.vendorName}</div>
                        {item.category && (
                          <div style={{ color: "#9ca3af", fontSize: 9 }}>{item.category}</div>
                        )}
                      </td>
                      {showQty && (
                        <td style={{ ...tdStyle("right"), color: "#6b7280" }}>
                          {fmtQty(item.quantity)}
                        </td>
                      )}
                      <td style={tdStyle("right")}>{fmtCurrency(item.unitTotal, currency)}</td>
                      {showMarkup && (
                        <td style={{ ...tdStyle("right"), color: "#6b7280" }}>
                          +{fmtCurrency(item.markupAmount * item.quantity, currency)}
                        </td>
                      )}
                      <td style={{ ...tdStyle("right"), fontWeight: 600 }}>
                        {fmtCurrency(item.lineTotal, currency)}
                      </td>
                      <td style={{ ...tdStyle("left"), color: "#6b7280" }}>{currency}</td>
                    </tr>
                  ))
                )}
                {/* Currency subtotals per group */}
                {[...byCurrency.entries()].map(([currency, currItems]) => {
                  const groupTotal = currItems.reduce((s, i) => s + i.lineTotal, 0);
                  const colspan = 1 + (showQty ? 1 : 0) + (showMarkup ? 1 : 0);
                  return (
                    <tr
                      key={`subtotal-${currency}`}
                      style={{ borderTop: "1px solid #e5e7eb", background: "#f9f7ff" }}
                    >
                      <td
                        colSpan={colspan}
                        style={{ padding: "5px 10px 5px 10px", color: "#6b7280", fontSize: 9 }}
                      />
                      <td style={{ ...tdStyle("right"), fontWeight: 600, fontSize: 10 }}>
                        {fmtCurrency(groupTotal, currency)}
                      </td>
                      <td style={{ ...tdStyle("left"), color: "#6b7280", fontSize: 9 }}>
                        {currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* ── Totals block ── */}
      <div
        style={{
          marginTop: 8,
          marginLeft: "auto",
          width: 280,
          borderTop: "2px solid #e5e7eb",
          paddingTop: 12,
        }}
      >
        {summaries.map((s) => (
          <div key={s.currency}>
            <div style={totalsRow()}>
              <span style={{ color: "#6b7280" }}>Subtotal {s.currency}</span>
              <span>{fmtCurrency(s.subtotal, s.currency)}</span>
            </div>
            {details.taxPercent > 0 && (
              <div style={totalsRow()}>
                <span style={{ color: "#6b7280" }}>Tax ({details.taxPercent}%)</span>
                <span>{fmtCurrency(s.taxAmount, s.currency)}</span>
              </div>
            )}
            <div
              style={{
                ...totalsRow(),
                fontWeight: 700,
                fontSize: 13,
                borderTop: "1px solid #e5e7eb",
                paddingTop: 6,
                marginTop: 4,
                color: "#6d5df6",
              }}
            >
              <span>Total {s.currency}</span>
              <span>{fmtCurrency(s.total, s.currency)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Notes ── */}
      {details.notes.trim() && (
        <div
          style={{
            marginTop: 32,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 12,
            fontSize: 10,
            color: "#6b7280",
          }}
        >
          <span style={{ fontWeight: 600, color: "#374151" }}>Notes: </span>
          {details.notes}
        </div>
      )}

      {/* ── Footer ── */}
      <div
        style={{
          marginTop: 40,
          borderTop: "1px solid #f3f4f6",
          paddingTop: 10,
          fontSize: 9,
          color: "#9ca3af",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Generated by Boopy · useboopy.com</span>
        <span>{details.invoiceNumber}</span>
      </div>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function thStyle(align: "left" | "right", width?: string): React.CSSProperties {
  return {
    padding: "6px 10px",
    textAlign: align,
    fontWeight: 600,
    color: "#6b7280",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    width,
  };
}

function tdStyle(align: "left" | "right"): React.CSSProperties {
  return {
    padding: "6px 10px",
    textAlign: align,
    verticalAlign: "top",
  };
}

function totalsRow(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    padding: "3px 0",
    fontSize: 11,
  };
}

function billingMonthsFromDetails(details: InvoiceDetails): number {
  if (!details.billingFrom || !details.billingTo) return 1;
  return billingMonths(details.billingFrom, details.billingTo);
}
