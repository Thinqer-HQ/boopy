"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InvoiceDocument } from "@/components/boopy/invoice-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { generateInvoiceExcel } from "@/lib/invoice/generate-excel";
import { billingMonths } from "@/lib/invoice/types";
import type { InvoiceDetails, InvoiceLineItem, InvoiceSummary } from "@/lib/invoice/types";
import { calculateTotalsByCurrency, formatCurrency } from "@/lib/reports/spend";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Cadence = "monthly" | "yearly" | "quarterly" | "custom";

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: Cadence;
  renewal_date: string;
  status: string;
  category: string | null;
  end_date: string | null;
  groups: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

type GroupRow = { id: string; name: string };
type ExportFormat = "xlsx" | "pdf" | "png";

function first<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function toMonthlyRate(amount: number, cadence: Cadence): number {
  if (cadence === "yearly") return amount / 12;
  if (cadence === "quarterly") return amount / 3;
  return amount;
}

function autoInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${year}${month}-${rand}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function lastOfMonth(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

function netDueDate(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-200",
            i < step ? "bg-primary w-6" : i === step ? "bg-primary w-4" : "bg-muted w-3"
          )}
        />
      ))}
      <span className="text-muted-foreground ml-1 text-xs">
        Step {step + 1} of {total}
      </span>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-[11px]">{hint}</p>}
    </div>
  );
}

// ── Step 1: Group Selection ───────────────────────────────────────────────────

function StepSelectGroups({
  groups,
  subs,
  selectedIds,
  onToggle,
  onSelectAll,
}: {
  groups: GroupRow[];
  subs: SubscriptionRow[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}) {
  const [search, setSearch] = useState("");

  const groupData = useMemo(() => {
    return groups.map((g) => {
      const groupSubs = subs.filter((s) => first(s.groups)?.id === g.id);
      const activeSubs = groupSubs.filter((s) => s.status === "active");
      const totals = calculateTotalsByCurrency(
        activeSubs.map((s) => ({
          amount: s.amount,
          cadence: s.cadence,
          status: s.status as "active" | "paused" | "cancelled",
          currency: s.currency,
          termEndDateYmd: s.end_date,
        }))
      );
      return { ...g, groupSubs, activeSubs, totals };
    });
  }, [groups, subs]);

  const filtered = search.trim()
    ? groupData.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groupData;

  const allSelected = groups.length > 0 && groups.every((g) => selectedIds.has(g.id));

  const selectedTotals = useMemo(() => {
    const sel = subs.filter((s) => {
      const gId = first(s.groups)?.id;
      return gId && selectedIds.has(gId) && s.status === "active";
    });
    return calculateTotalsByCurrency(
      sel.map((s) => ({
        amount: s.amount,
        cadence: s.cadence,
        status: s.status as "active" | "paused" | "cancelled",
        currency: s.currency,
        termEndDateYmd: s.end_date,
      }))
    );
  }, [subs, selectedIds]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={onSelectAll}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No groups found. Create a group first.
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onToggle(g.id)}
              className={cn(
                "hover:bg-accent/50 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                selectedIds.has(g.id) ? "border-primary/30 bg-accent/40" : "border-border/60"
              )}
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                  selectedIds.has(g.id) ? "border-primary bg-primary" : "border-muted-foreground/40"
                )}
              >
                {selectedIds.has(g.id) && <Check className="text-primary-foreground size-2.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{g.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {g.activeSubs.length} active subscription{g.activeSubs.length !== 1 ? "s" : ""}
                  {g.groupSubs.length !== g.activeSubs.length
                    ? ` · ${g.groupSubs.length} total`
                    : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {g.totals.length > 0 ? (
                  <div className="space-y-0.5">
                    {g.totals.map((t) => (
                      <p key={t.currency} className="text-xs font-semibold tabular-nums">
                        {formatCurrency(t.monthly, t.currency)}
                        <span className="text-muted-foreground font-normal">/mo</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">—</p>
                )}
              </div>
              {selectedIds.has(g.id) && <Check className="text-primary size-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="bg-accent/40 border-primary/20 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-3 py-2">
          <span className="text-primary text-xs font-semibold">
            {selectedIds.size} group{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          {selectedTotals.map((t) => (
            <span key={t.currency} className="text-xs font-medium tabular-nums">
              {formatCurrency(t.monthly, t.currency)}/mo {t.currency}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Invoice Details ───────────────────────────────────────────────────

function StepInvoiceDetails({
  details,
  onChange,
}: {
  details: InvoiceDetails;
  onChange: (patch: Partial<InvoiceDetails>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* From / To */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            From (Your Agency)
          </p>
          <Field label="Agency name *">
            <Input
              value={details.fromName}
              onChange={(e) => onChange({ fromName: e.target.value })}
              placeholder="Acme Agency Inc."
              className="h-8 text-sm"
              autoComplete="organization"
            />
          </Field>
          <Field label="Address">
            <Textarea
              value={details.fromAddress}
              onChange={(e) => onChange({ fromAddress: e.target.value })}
              placeholder={"123 Agency Street\nNew York, NY 10001"}
              rows={2}
              className="resize-none text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Email">
              <Input
                value={details.fromEmail}
                onChange={(e) => onChange({ fromEmail: e.target.value })}
                placeholder="billing@agency.com"
                className="h-8 text-sm"
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={details.fromPhone}
                onChange={(e) => onChange({ fromPhone: e.target.value })}
                placeholder="+1-555-0123"
                className="h-8 text-sm"
                type="tel"
                autoComplete="tel"
              />
            </Field>
          </div>
          <Field label="VAT / Tax number">
            <Input
              value={details.fromVatNumber}
              onChange={(e) => onChange({ fromVatNumber: e.target.value })}
              placeholder="GB123456789"
              className="h-8 text-sm"
              autoComplete="off"
            />
          </Field>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Bill To (Client)
          </p>
          <Field label="Client name *">
            <Input
              value={details.toName}
              onChange={(e) => onChange({ toName: e.target.value })}
              placeholder="Client Company Ltd."
              className="h-8 text-sm"
              autoComplete="off"
            />
          </Field>
          <Field label="Address">
            <Textarea
              value={details.toAddress}
              onChange={(e) => onChange({ toAddress: e.target.value })}
              placeholder={"456 Client Avenue\nSan Francisco, CA 94105"}
              rows={2}
              className="resize-none text-sm"
            />
          </Field>
          <Field label="Email">
            <Input
              value={details.toEmail}
              onChange={(e) => onChange({ toEmail: e.target.value })}
              placeholder="accounts@client.com"
              className="h-8 text-sm"
              type="email"
              autoComplete="off"
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Invoice metadata */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Invoice details
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Invoice number">
            <Input
              value={details.invoiceNumber}
              onChange={(e) => onChange({ invoiceNumber: e.target.value })}
              className="h-8 text-sm"
              autoComplete="off"
            />
          </Field>
          <Field label="Issue date">
            <Input
              type="date"
              value={details.issueDate}
              onChange={(e) => onChange({ issueDate: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Due date">
            <Input
              type="date"
              value={details.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="PO number (optional)">
            <Input
              value={details.poNumber}
              onChange={(e) => onChange({ poNumber: e.target.value })}
              placeholder="PO-2026-123"
              className="h-8 w-48 text-sm"
              autoComplete="off"
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Billing period */}
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
          Billing period
        </p>
        <p className="text-muted-foreground mb-3 text-[11px]">
          The period you are billing for. Subscription costs are prorated automatically.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From">
            <Input
              type="date"
              value={details.billingFrom}
              onChange={(e) => onChange({ billingFrom: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>
          <Field label="To (inclusive)">
            <Input
              type="date"
              value={details.billingTo}
              onChange={(e) => onChange({ billingTo: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>
        </div>
        {details.billingFrom && details.billingTo && (
          <p className="text-muted-foreground mt-2 text-[11px]">
            {(() => {
              const m = billingMonths(details.billingFrom, details.billingTo);
              return `${m.toFixed(m % 1 === 0 ? 0 : 2)} month${m === 1 ? "" : "s"} — all subscription costs multiplied by this factor`;
            })()}
          </p>
        )}
      </div>

      <Separator />

      {/* Pricing adjustments */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Pricing adjustments
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Agency markup %"
            hint="Added on top of each subscription cost. Leave 0 to bill at cost."
          >
            <div className="relative w-32">
              <Input
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={details.markupPercent}
                onChange={(e) => onChange({ markupPercent: parseFloat(e.target.value) || 0 })}
                className="h-8 pr-7 text-sm"
              />
              <span className="text-muted-foreground pointer-events-none absolute top-2 right-2.5 text-xs">
                %
              </span>
            </div>
          </Field>
          <Field
            label="Tax rate %"
            hint="Applied to the total after markup. Leave 0 for tax-exempt."
          >
            <div className="relative w-32">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={details.taxPercent}
                onChange={(e) => onChange({ taxPercent: parseFloat(e.target.value) || 0 })}
                className="h-8 pr-7 text-sm"
              />
              <span className="text-muted-foreground pointer-events-none absolute top-2 right-2.5 text-xs">
                %
              </span>
            </div>
          </Field>
        </div>
      </div>

      <Separator />

      <Field label="Payment terms / notes">
        <Textarea
          value={details.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Net 30 — payment due within 30 days of invoice date."
          rows={2}
          className="resize-none text-sm"
        />
      </Field>
    </div>
  );
}

// ── Step 3: Preview & Download ────────────────────────────────────────────────

function StepPreview({
  details,
  lineItems,
  summaries,
  onDownload,
  downloading,
  format,
  setFormat,
}: {
  details: InvoiceDetails;
  lineItems: InvoiceLineItem[];
  summaries: InvoiceSummary[];
  onDownload: () => void;
  downloading: boolean;
  format: ExportFormat;
  setFormat: (f: ExportFormat) => void;
}) {
  const FORMATS: { key: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { key: "xlsx", label: "Excel (.xlsx)", icon: <FileSpreadsheet className="size-3.5" /> },
    { key: "pdf", label: "PDF (A4)", icon: <FileText className="size-3.5" /> },
    { key: "png", label: "Image (PNG)", icon: <FileImage className="size-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Format picker */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">Export as:</span>
        {FORMATS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFormat(f.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
              format === f.key
                ? "border-primary bg-accent text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Hidden full-resolution element for html2canvas capture */}
      <div
        aria-hidden
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", zIndex: -1 }}
        id="invoice-document-capture"
      >
        <InvoiceDocument details={details} lineItems={lineItems} summaries={summaries} />
      </div>

      {/* Visible preview — zoom affects layout correctly, no gap issues */}
      <div className="rounded-xl border bg-gray-100 p-3">
        <div style={{ zoom: "62%" }}>
          <InvoiceDocument details={details} lineItems={lineItems} summaries={summaries} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full gap-2 shadow-[0_4px_14px_rgba(109,93,246,0.25)]"
        disabled={downloading}
        onClick={onDownload}
      >
        {downloading ? (
          "Preparing…"
        ) : (
          <>
            <Download className="size-4" />
            Download{" "}
            {format === "xlsx" ? "Excel (.xlsx)" : format === "pdf" ? "PDF" : "Image (PNG)"}
          </>
        )}
      </Button>
    </div>
  );
}

// ── Build line items ──────────────────────────────────────────────────────────

function buildLineItems(
  subs: SubscriptionRow[],
  selectedIds: Set<string>,
  markupPercent: number,
  billingFrom: string,
  billingTo: string
): InvoiceLineItem[] {
  const qty = billingMonths(billingFrom, billingTo);
  const markup = markupPercent / 100;

  return subs
    .filter((s) => {
      const gId = first(s.groups)?.id;
      return gId && selectedIds.has(gId) && s.status === "active";
    })
    .map((s) => {
      const g = first(s.groups)!;
      const raw = Number(s.amount) || 0;
      const monthly = toMonthlyRate(raw, s.cadence);
      const markupAmt = monthly * markup;
      const unitTotal = monthly + markupAmt;
      const lineTotal = unitTotal * qty;
      return {
        id: s.id,
        groupId: g.id,
        groupName: g.name,
        vendorName: s.vendor_name,
        category: s.category,
        cadence: s.cadence,
        renewalDate: s.renewal_date,
        unitAmount: monthly,
        currency: s.currency.toUpperCase(),
        markupPercent,
        markupAmount: markupAmt,
        unitTotal,
        quantity: qty,
        lineTotal,
      };
    });
}

function buildSummaries(items: InvoiceLineItem[], taxPercent: number): InvoiceSummary[] {
  const byC = new Map<string, number>();
  for (const item of items) {
    byC.set(item.currency, (byC.get(item.currency) ?? 0) + item.lineTotal);
  }
  return [...byC.entries()].map(([currency, subtotal]) => {
    const taxAmount = subtotal * (taxPercent / 100);
    return { currency, subtotal, taxAmount, total: subtotal + taxAmount };
  });
}

// ── Main Dialog ───────────────────────────────────────────────────────────────

export function InvoiceGeneratorDialog({
  open,
  onOpenChange,
  groups,
  subs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: GroupRow[];
  subs: SubscriptionRow[];
}) {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<InvoiceDetails>(() => ({
    fromName: "",
    fromAddress: "",
    fromEmail: "",
    fromPhone: "",
    fromVatNumber: "",
    toName: "",
    toAddress: "",
    toEmail: "",
    invoiceNumber: autoInvoiceNumber(),
    issueDate: todayStr(),
    dueDate: netDueDate(30),
    billingFrom: firstOfMonth(),
    billingTo: lastOfMonth(),
    poNumber: "",
    markupPercent: 0,
    taxPercent: 0,
    notes: "Net 30 — Payment due within 30 days of invoice date.",
  }));
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [downloading, setDownloading] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(0);
      setSelectedIds(new Set());
      setDetails((d) => ({
        ...d,
        invoiceNumber: autoInvoiceNumber(),
        issueDate: todayStr(),
        dueDate: netDueDate(30),
        billingFrom: firstOfMonth(),
        billingTo: lastOfMonth(),
        toName: "",
      }));
    }
  }, [open]);

  function toggleGroup(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === groups.length ? new Set() : new Set(groups.map((g) => g.id))
    );
  }

  const lineItems = useMemo(
    () =>
      buildLineItems(
        subs,
        selectedIds,
        details.markupPercent,
        details.billingFrom,
        details.billingTo
      ),
    [subs, selectedIds, details.markupPercent, details.billingFrom, details.billingTo]
  );

  const summaries = useMemo(
    () => buildSummaries(lineItems, details.taxPercent),
    [lineItems, details.taxPercent]
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      if (format === "xlsx") {
        generateInvoiceExcel(details, lineItems, summaries);
      } else {
        const el = document.getElementById("invoice-document-capture");
        if (!el) return;
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        if (format === "png") {
          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Invoice-${details.invoiceNumber || "export"}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }, "image/png");
        } else {
          // PDF via pdf-lib
          const { PDFDocument } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.create();
          // A4 at 72dpi: 595.28 × 841.89 pts
          const page = pdfDoc.addPage([595.28, 841.89]);
          const imgData = canvas.toDataURL("image/png");
          const pngImage = await pdfDoc.embedPng(imgData);
          const { width: iw, height: ih } = pngImage.scale(1);
          // Fit to A4 width
          const scale = 595.28 / iw;
          const scaledH = ih * scale;
          page.drawImage(pngImage, {
            x: 0,
            y: Math.max(0, 841.89 - scaledH),
            width: 595.28,
            height: Math.min(scaledH, 841.89),
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Invoice-${details.invoiceNumber || "export"}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } finally {
      setDownloading(false);
    }
  }, [format, details, lineItems, summaries]);

  const canProceedStep0 = selectedIds.size > 0;
  const canProceedStep1 = details.fromName.trim().length > 0 && details.toName.trim().length > 0;
  const STEPS = ["Select groups", "Invoice details", "Preview & download"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="text-primary size-4" />
                Generate Invoice
              </DialogTitle>
              <DialogDescription>{STEPS[step]}</DialogDescription>
            </div>
            <StepIndicator step={step} total={3} />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <StepSelectGroups
              groups={groups}
              subs={subs}
              selectedIds={selectedIds}
              onToggle={toggleGroup}
              onSelectAll={toggleAll}
            />
          )}
          {step === 1 && (
            <StepInvoiceDetails
              details={details}
              onChange={(patch) => setDetails((d) => ({ ...d, ...patch }))}
            />
          )}
          {step === 2 && (
            <StepPreview
              details={details}
              lineItems={lineItems}
              summaries={summaries}
              onDownload={handleDownload}
              downloading={downloading}
              format={format}
              setFormat={setFormat}
            />
          )}
        </div>

        <div className="shrink-0 border-t px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (step === 0 ? onOpenChange(false) : setStep((s) => s - 1))}
              className="gap-1.5"
            >
              {step === 0 ? (
                "Cancel"
              ) : (
                <>
                  <ChevronLeft className="size-3.5" />
                  Back
                </>
              )}
            </Button>
            {step < 2 && (
              <Button
                size="sm"
                disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                onClick={() => setStep((s) => s + 1)}
                className="gap-1.5"
              >
                {step === 1 ? "Preview" : "Next"}
                <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
