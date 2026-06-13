"use client";

import { Check, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

function first<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function toMonthly(amount: number, cadence: Cadence, endDate: string | null): number {
  if (endDate) return 0;
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

// ── Field component ────────────────────────────────────────────────────────────

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

// ── Step 1: Group Selection ────────────────────────────────────────────────────

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
      const currencies = [...new Set(activeSubs.map((s) => s.currency))];
      return { ...g, groupSubs, activeSubs, totals, currencies };
    });
  }, [groups, subs]);

  const filtered = search.trim()
    ? groupData.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groupData;

  const allSelected = groups.length > 0 && groups.every((g) => selectedIds.has(g.id));
  const selectedCount = selectedIds.size;
  const selectedTotals = useMemo(() => {
    const selectedSubs = subs.filter((s) => {
      const gId = first(s.groups)?.id;
      return gId && selectedIds.has(gId) && s.status === "active";
    });
    return calculateTotalsByCurrency(
      selectedSubs.map((s) => ({
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
                {g.currencies.length > 1 && (
                  <p className="text-muted-foreground text-[10px]">{g.currencies.join(", ")}</p>
                )}
              </div>
              {selectedIds.has(g.id) && <Check className="text-primary size-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="bg-accent/40 border-primary/20 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-3 py-2">
          <span className="text-primary text-xs font-semibold">
            {selectedCount} group{selectedCount !== 1 ? "s" : ""} selected
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

// ── Step 2: Invoice Details ────────────────────────────────────────────────────

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
            />
          </Field>
          <Field label="Address">
            <Textarea
              value={details.fromAddress}
              onChange={(e) => onChange({ fromAddress: e.target.value })}
              placeholder="123 Agency Street&#10;New York, NY 10001"
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
              />
            </Field>
            <Field label="Phone">
              <Input
                value={details.fromPhone}
                onChange={(e) => onChange({ fromPhone: e.target.value })}
                placeholder="+1-555-0123"
                className="h-8 text-sm"
              />
            </Field>
          </div>
          <Field label="VAT / Tax number">
            <Input
              value={details.fromVatNumber}
              onChange={(e) => onChange({ fromVatNumber: e.target.value })}
              placeholder="GB123456789"
              className="h-8 text-sm"
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
            />
          </Field>
          <Field label="Address">
            <Textarea
              value={details.toAddress}
              onChange={(e) => onChange({ toAddress: e.target.value })}
              placeholder="456 Client Avenue&#10;San Francisco, CA 94105"
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
              className="h-8 max-w-[200px] text-sm"
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Pricing adjustments
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Agency markup %"
            hint="Added on top of each subscription cost. Leave 0 to bill at cost."
          >
            <div className="relative max-w-[120px]">
              <Input
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={details.markupPercent}
                onChange={(e) => onChange({ markupPercent: parseFloat(e.target.value) || 0 })}
                className="h-8 pr-6 text-sm"
              />
              <span className="text-muted-foreground absolute top-2 right-2.5 text-xs">%</span>
            </div>
          </Field>
          <Field
            label="Tax rate %"
            hint="Applied to the total after markup. Leave 0 for tax-exempt."
          >
            <div className="relative max-w-[120px]">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={details.taxPercent}
                onChange={(e) => onChange({ taxPercent: parseFloat(e.target.value) || 0 })}
                className="h-8 pr-6 text-sm"
              />
              <span className="text-muted-foreground absolute top-2 right-2.5 text-xs">%</span>
            </div>
          </Field>
        </div>
      </div>

      <Separator />

      {/* Notes */}
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

// ── Step 3: Preview & Download ─────────────────────────────────────────────────

function StepPreview({
  details,
  lineItems,
  summaries,
  onDownload,
  downloading,
}: {
  details: InvoiceDetails;
  lineItems: InvoiceLineItem[];
  summaries: InvoiceSummary[];
  onDownload: () => void;
  downloading: boolean;
}) {
  const showMarkup = details.markupPercent > 0;

  const byGroup = useMemo(() => {
    const map = new Map<string, { name: string; items: InvoiceLineItem[] }>();
    for (const item of lineItems) {
      if (!map.has(item.groupId)) map.set(item.groupId, { name: item.groupName, items: [] });
      map.get(item.groupId)!.items.push(item);
    }
    return [...map.values()];
  }, [lineItems]);

  return (
    <div className="flex flex-col gap-4">
      {/* Invoice header preview */}
      <div className="bg-muted/40 grid gap-4 rounded-xl px-4 py-3 sm:grid-cols-2">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold tracking-wide text-[#6d5df6] uppercase">From</p>
          <p className="text-sm font-semibold">{details.fromName || "—"}</p>
          {details.fromAddress && (
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">
              {details.fromAddress}
            </p>
          )}
          {details.fromEmail && (
            <p className="text-muted-foreground text-xs">{details.fromEmail}</p>
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            Bill To
          </p>
          <p className="text-sm font-semibold">{details.toName || "—"}</p>
          {details.toAddress && (
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">{details.toAddress}</p>
          )}
          {details.toEmail && <p className="text-muted-foreground text-xs">{details.toEmail}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <Badge variant="outline" className="gap-1 font-mono">
          {details.invoiceNumber}
        </Badge>
        {details.issueDate && (
          <span className="text-muted-foreground">
            Issued:{" "}
            <span className="text-foreground font-medium">
              {new Date(details.issueDate + "T00:00:00Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
          </span>
        )}
        {details.dueDate && (
          <span className="text-muted-foreground">
            Due:{" "}
            <span className="text-foreground font-medium">
              {new Date(details.dueDate + "T00:00:00Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
          </span>
        )}
      </div>

      {/* Line items */}
      {byGroup.map(({ name, items }) => (
        <div key={name} className="overflow-hidden rounded-xl border">
          <div className="bg-muted/50 border-b px-3 py-1.5">
            <p className="text-xs font-semibold">{name}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">Service</th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">Cycle</th>
                  <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                    Unit Cost
                  </th>
                  {showMarkup && (
                    <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                      +{details.markupPercent}%
                    </th>
                  )}
                  <th className="text-muted-foreground px-3 py-2 text-right font-medium">Total</th>
                  <th className="text-muted-foreground px-3 py-2 text-left font-medium">Cur.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{item.vendorName}</td>
                    <td className="text-muted-foreground px-3 py-2 capitalize">{item.cadence}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(item.unitAmount, item.currency)}
                    </td>
                    {showMarkup && (
                      <td className="text-muted-foreground px-3 py-2 text-right tabular-nums">
                        +{formatCurrency(item.markupAmount, item.currency)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      {formatCurrency(item.totalAmount, item.currency)}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">{item.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Totals */}
      <div className="border-primary/20 bg-accent/20 space-y-1.5 rounded-xl border px-4 py-3">
        {summaries.map((s) => (
          <div key={s.currency} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({s.currency})</span>
              <span className="tabular-nums">{formatCurrency(s.subtotal, s.currency)}</span>
            </div>
            {details.taxPercent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax ({details.taxPercent}%)</span>
                <span className="tabular-nums">{formatCurrency(s.taxAmount, s.currency)}</span>
              </div>
            )}
            <div className="border-primary/20 flex items-center justify-between border-t pt-1">
              <span className="font-semibold">Total {s.currency}</span>
              <span className="text-primary font-heading text-base font-bold tabular-nums">
                {formatCurrency(s.total, s.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {details.notes.trim() && (
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-medium">Notes: </span>
          {details.notes}
        </p>
      )}

      {/* Download CTA */}
      <Button
        size="lg"
        className="mt-2 w-full gap-2 shadow-[0_4px_14px_rgba(109,93,246,0.25)]"
        disabled={downloading}
        onClick={onDownload}
      >
        {downloading ? (
          <>Preparing…</>
        ) : (
          <>
            <Download className="size-4" />
            Download Invoice (.xlsx)
          </>
        )}
      </Button>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────────────────────────

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
  const [details, setDetails] = useState<InvoiceDetails>({
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
    poNumber: "",
    markupPercent: 0,
    taxPercent: 0,
    notes: "Net 30 — Payment due within 30 days of invoice date.",
  });
  const [downloading, setDownloading] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(0);
      setSelectedIds(new Set());
      setDetails((d) => ({ ...d, invoiceNumber: autoInvoiceNumber() }));
    }
  }, [open]);

  // Auto-fill "Bill To" from first selected group name
  useEffect(() => {
    if (selectedIds.size === 1) {
      const gId = [...selectedIds][0]!;
      const g = groups.find((g) => g.id === gId);
      if (g && !details.toName) {
        setDetails((d) => ({ ...d, toName: g.name }));
      }
    }
  }, [selectedIds, groups, details.toName]);

  function toggleGroup(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Clear auto-filled toName if it was from this group
        const g = groups.find((g) => g.id === id);
        if (g && details.toName === g.name) {
          setDetails((d) => ({ ...d, toName: "" }));
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === groups.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(groups.map((g) => g.id)));
    }
  }

  // Build line items from selected groups
  const lineItems = useMemo((): InvoiceLineItem[] => {
    const markup = details.markupPercent / 100;
    return subs
      .filter((s) => {
        const gId = first(s.groups)?.id;
        return gId && selectedIds.has(gId) && s.status === "active";
      })
      .map((s) => {
        const g = first(s.groups)!;
        const unit = Number(s.amount) || 0;
        const markupAmt = unit * markup;
        const total = unit + markupAmt;
        return {
          id: s.id,
          groupId: g.id,
          groupName: g.name,
          vendorName: s.vendor_name,
          category: s.category,
          cadence: s.cadence,
          renewalDate: s.renewal_date,
          unitAmount: unit,
          currency: s.currency.toUpperCase(),
          markupPercent: details.markupPercent,
          markupAmount: markupAmt,
          totalAmount: total,
        };
      });
  }, [subs, selectedIds, details.markupPercent]);

  // Build per-currency summaries
  const summaries = useMemo((): InvoiceSummary[] => {
    const byC = new Map<string, number>();
    for (const item of lineItems) {
      byC.set(item.currency, (byC.get(item.currency) ?? 0) + item.totalAmount);
    }
    return [...byC.entries()].map(([currency, subtotal]) => {
      const taxAmount = subtotal * (details.taxPercent / 100);
      return { currency, subtotal, taxAmount, total: subtotal + taxAmount };
    });
  }, [lineItems, details.taxPercent]);

  function handleDownload() {
    setDownloading(true);
    try {
      generateInvoiceExcel(details, lineItems, summaries);
    } finally {
      setDownloading(false);
    }
  }

  const canProceedStep0 = selectedIds.size > 0;
  const canProceedStep1 = details.fromName.trim() && details.toName.trim();

  const STEPS = ["Select groups", "Invoice details", "Preview & download"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Header */}
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

        {/* Body */}
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
            />
          )}
        </div>

        {/* Footer navigation */}
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

            {step === 2 && (
              <Button size="sm" variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <ChevronLeft className="size-3.5" />
                Edit details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
