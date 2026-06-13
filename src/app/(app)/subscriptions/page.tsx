"use client";

import {
  BarChart2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileUp,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GoogleIntegrationButtons } from "@/components/boopy/google-integration-buttons";
import { InvoiceGeneratorDialog } from "@/components/boopy/invoice-generator-dialog";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrencyOptions } from "@/lib/currencies";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { calculateTotalsByCurrency, formatCurrency } from "@/lib/reports/spend";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const GROUP_COLORS = ["#6d5df6", "#1faa6b", "#e8843c", "#3a93ee", "#f1465a", "#8b7cf8"];

type Cadence = "monthly" | "yearly" | "quarterly" | "custom";
type SubStatus = "active" | "paused" | "cancelled";

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: Cadence;
  renewal_date: string;
  start_date: string | null;
  end_date: string | null;
  status: SubStatus;
  category: string | null;
  notes: string | null;
  groups: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

type GroupRow = { id: string; name: string; notes: string | null };

function first<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function cadenceShort(c: Cadence) {
  return c === "monthly" ? "mo" : c === "yearly" ? "yr" : c === "quarterly" ? "qtr" : "—";
}

function termDateError(s: string, e: string): string | null {
  if (!s.trim() || !e.trim()) return null;
  return e < s ? "End date must be on or after start date." : null;
}

const DIALOG_CLASS =
  "max-h-[min(93dvh,52rem)] overflow-y-auto overscroll-contain sm:max-w-lg xl:max-w-3xl";
const FORM_GRID = "grid gap-2 py-1 sm:grid-cols-2 sm:py-2 xl:grid-cols-3 xl:gap-x-4 xl:gap-y-2";

export default function SubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusGroupId = searchParams.get("group");
  const addGroupParam = searchParams.get("addGroup");
  const { state } = usePrimaryWorkspace();

  const [view, setView] = useState<"groups" | "list">("groups");
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sub form
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteSubOpen, setDeleteSubOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formGroupId, setFormGroupId] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [subStatus, setSubStatus] = useState<SubStatus>("active");

  // Receipt extraction
  const [extracting, setExtracting] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [extractHints, setExtractHints] = useState<string[]>([]);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Invoice generator
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Group management
  const [manageOpen, setManageOpen] = useState(false);
  const [editGroupRow, setEditGroupRow] = useState<GroupRow | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState("");
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  const load = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const [subsRes, groupsRes, wsRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select(
          "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, category, notes, groups!inner(id, name, workspace_id)"
        )
        .eq("groups.workspace_id", state.workspaceId)
        .order("renewal_date", { ascending: true }),
      supabase
        .from("groups")
        .select("id, name, notes")
        .eq("workspace_id", state.workspaceId)
        .order("name"),
      supabase
        .from("workspaces")
        .select("default_currency")
        .eq("id", state.workspaceId)
        .maybeSingle(),
    ]);
    if (subsRes.error || groupsRes.error) {
      setError(subsRes.error?.message ?? groupsRes.error?.message ?? "Failed loading.");
      return;
    }
    setError(null);
    setSubs((subsRes.data ?? []) as SubscriptionRow[]);
    setGroups((groupsRes.data ?? []) as GroupRow[]);
    setDefaultCurrency(wsRes.data?.default_currency ?? "USD");
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  // Scroll to focused group from URL param
  useEffect(() => {
    if (!focusGroupId || !groups.length) return;
    setExpanded((prev) => ({ ...prev, [focusGroupId]: true }));
    const t = setTimeout(() => {
      groupRefs.current[focusGroupId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [focusGroupId, groups]);

  // Open add-group dialog from URL param
  useEffect(() => {
    if (addGroupParam !== "1") return;
    setManageOpen(true);
    setAddGroupOpen(true);
  }, [addGroupParam]);

  const colorMap = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach((g, i) => m.set(g.id, GROUP_COLORS[i % GROUP_COLORS.length] ?? GROUP_COLORS[0]));
    return m;
  }, [groups]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, { groupId: string; groupName: string; subs: SubscriptionRow[] }>();
    for (const g of groups) map.set(g.id, { groupId: g.id, groupName: g.name, subs: [] });
    for (const s of subs) {
      const g = first(s.groups);
      const gid = g?.id ?? "unknown";
      const gname = g?.name ?? "Unknown";
      const searchable = `${s.vendor_name} ${s.category ?? ""} ${gname}`.toLowerCase();
      if (q && !searchable.includes(q)) continue;
      if (!map.has(gid)) map.set(gid, { groupId: gid, groupName: gname, subs: [] });
      map.get(gid)?.subs.push(s);
    }
    return Array.from(map.values()).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [groups, subs, query]);

  const flatSubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subs.filter((s) => {
      if (!q) return true;
      const g = first(s.groups);
      return `${s.vendor_name} ${s.category ?? ""} ${g?.name ?? ""}`.toLowerCase().includes(q);
    });
  }, [subs, query]);

  const summary = useMemo(() => {
    const active = subs.filter((s) => s.status === "active").length;
    const totals = calculateTotalsByCurrency(
      subs.map((s) => ({
        amount: s.amount,
        cadence: s.cadence,
        status: s.status,
        currency: s.currency,
        termEndDateYmd: s.end_date,
      }))
    );
    return { active, total: subs.length, totals };
  }, [subs]);

  function openAdd(groupId: string) {
    setFormGroupId(groupId);
    setVendor("");
    setAmount("");
    setCurrency(defaultCurrency);
    setCadence("monthly");
    setRenewalDate("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    setSubNotes("");
    setSubStatus("active");
    setEditingId(null);
    setReceiptFileName(null);
    setExtractHints([]);
    setExtracting(false);
    setAddOpen(true);
  }

  async function handleReceiptFile(file: File) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    setExtracting(true);
    setReceiptFileName(file.name);
    setExtractHints([]);
    const form = new FormData();
    form.append("workspaceId", state.workspaceId);
    form.append("file", file);
    const res = await fetch("/api/subscriptions/extract-from-file", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      fields?: {
        vendorName: string | null;
        amount: number | null;
        currency: string | null;
        cadence: Cadence | null;
        renewalDate: string | null;
      };
      hints?: string[];
    };
    setExtracting(false);
    if (!res.ok || !json.fields) {
      setError(json.error ?? "Could not read receipt.");
      setReceiptFileName(null);
      return;
    }
    if (json.fields.vendorName) setVendor(json.fields.vendorName);
    if (json.fields.amount !== null && json.fields.amount !== undefined)
      setAmount(String(json.fields.amount));
    if (json.fields.currency) setCurrency(json.fields.currency);
    if (json.fields.cadence) setCadence(json.fields.cadence);
    if (json.fields.renewalDate) setRenewalDate(json.fields.renewalDate);
    if (json.hints?.length) setExtractHints(json.hints);
  }

  function openEdit(groupId: string, sub: SubscriptionRow) {
    setFormGroupId(groupId);
    setVendor(sub.vendor_name);
    setAmount(String(sub.amount));
    setCurrency(sub.currency);
    setCadence(sub.cadence);
    setRenewalDate(sub.renewal_date);
    setStartDate(sub.start_date ?? "");
    setEndDate(sub.end_date ?? "");
    setCategory(sub.category ?? "");
    setSubNotes(sub.notes ?? "");
    setSubStatus(sub.status);
    setEditingId(sub.id);
    setEditOpen(true);
  }

  async function createSub() {
    if (!formGroupId || !vendor.trim() || !renewalDate) {
      setError("Group, vendor, and renewal date are required.");
      return;
    }
    const te = termDateError(startDate, endDate);
    if (te) {
      setError(te);
      return;
    }
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const cur = currency.trim().toUpperCase();
    if (cur.length < 3) {
      setError("Currency must be 3+ characters.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: e } = await supabase.from("subscriptions").insert({
      group_id: formGroupId,
      vendor_name: vendor.trim(),
      amount: amt,
      currency: cur,
      cadence,
      renewal_date: renewalDate,
      start_date: startDate.trim() || null,
      end_date: endDate.trim() || null,
      status: subStatus,
      category: category.trim() || null,
      notes: subNotes.trim() || null,
    });
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setAddOpen(false);
    setError(null);
    await load();
  }

  async function updateSub() {
    if (!editingId || !formGroupId || !vendor.trim() || !renewalDate) {
      setError("Group, vendor, and renewal date are required.");
      return;
    }
    const te = termDateError(startDate, endDate);
    if (te) {
      setError(te);
      return;
    }
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const cur = currency.trim().toUpperCase();
    if (cur.length < 3) {
      setError("Currency must be 3+ characters.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: e } = await supabase
      .from("subscriptions")
      .update({
        group_id: formGroupId,
        vendor_name: vendor.trim(),
        amount: amt,
        currency: cur,
        cadence,
        renewal_date: renewalDate,
        start_date: startDate.trim() || null,
        end_date: endDate.trim() || null,
        status: subStatus,
        category: category.trim() || null,
        notes: subNotes.trim() || null,
      })
      .eq("id", editingId);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setEditOpen(false);
    setEditingId(null);
    setError(null);
    await load();
  }

  async function deleteSub() {
    if (!editingId) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: e } = await supabase.from("subscriptions").delete().eq("id", editingId);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setSubs((c) => c.filter((s) => s.id !== editingId));
    setEditOpen(false);
    setDeleteSubOpen(false);
    setEditingId(null);
  }

  async function createGroup() {
    if (state.status !== "ready" || !newGroupName.trim()) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { data, error: e } = await supabase
      .from("groups")
      .insert({ workspace_id: state.workspaceId, name: newGroupName.trim(), notes: null })
      .select("id, name, notes")
      .single();
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setGroups((c) => [...c, data as GroupRow].sort((a, b) => a.name.localeCompare(b.name)));
    setNewGroupName("");
    setAddGroupOpen(false);
  }

  async function updateGroup() {
    if (!editGroupRow || !editGroupName.trim()) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: e } = await supabase
      .from("groups")
      .update({ name: editGroupName.trim(), notes: editGroupRow.notes })
      .eq("id", editGroupRow.id);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setGroups((c) =>
      c.map((g) => (g.id === editGroupRow.id ? { ...g, name: editGroupName.trim() } : g))
    );
    setEditGroupRow(null);
  }

  async function deleteGroup(id: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: e } = await supabase.from("groups").delete().eq("id", id);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setGroups((c) => c.filter((g) => g.id !== id));
    setDeleteGroupId(null);
    setDeleteGroupConfirm("");
    await load();
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready")
    return <div className="text-muted-foreground p-8 text-sm">Loading subscriptions…</div>;

  // Shared subscription form fields (used in add + edit dialogs)
  const subFormFields = (
    <div className={FORM_GRID}>
      <div className="grid gap-1.5 sm:col-span-2 xl:col-span-3">
        <Label>Group</Label>
        <select
          value={formGroupId}
          onChange={(e) => setFormGroupId(e.target.value)}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Select a group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5 sm:col-span-2 xl:col-span-3">
        <Label>Vendor</Label>
        <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Notion" />
      </div>
      <div className="grid gap-1.5">
        <Label>Amount</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Currency</Label>
        <Input
          value={currency}
          maxLength={8}
          list="sub-currencies"
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
        />
        <datalist id="sub-currencies">
          {currencyOptions.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>
      <div className="grid gap-1.5">
        <Label>Cadence</Label>
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as Cadence)}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label>Renewal date</Label>
        <Input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2 xl:col-span-3">
        <div className="grid gap-1.5">
          <Label>Start date (optional)</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>End date (optional)</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <p className="text-muted-foreground -mt-1 text-xs sm:col-span-2 xl:col-span-3">
        End date: no billing or reminders after this day. Leave blank for ongoing.
      </p>
      <div className="grid gap-1.5">
        <Label>Status</Label>
        <select
          value={subStatus}
          onChange={(e) => setSubStatus(e.target.value as SubStatus)}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="grid gap-1.5 xl:col-span-2">
        <Label>Category</Label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Software"
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2 xl:col-span-3">
        <Label>Notes</Label>
        <Textarea
          value={subNotes}
          onChange={(e) => setSubNotes(e.target.value)}
          rows={2}
          className="max-h-28 min-h-0 resize-y"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground text-sm">
            {summary.active} active · {summary.total} total across {groups.length} group
            {groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="border-border flex overflow-hidden rounded-lg border">
            <button
              type="button"
              onClick={() => setView("groups")}
              className={cn(
                "flex h-8 items-center gap-1.5 px-3 text-xs font-medium transition-colors",
                view === "groups"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
              Groups
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "flex h-8 items-center gap-1.5 px-3 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
              List
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
            <Settings2 className="size-3.5" />
            <span className="hidden sm:inline">Manage groups</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(true)}>
            <FileSpreadsheet className="size-3.5" />
            <span className="hidden sm:inline">Invoice</span>
          </Button>
          <Link href="/documents" className="hidden sm:block">
            <Button variant="outline" size="sm">
              <FileUp className="size-3.5" />
              Bulk upload
            </Button>
          </Link>
          <Button size="sm" onClick={() => openAdd("")}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      {summary.totals.length > 0 && (
        <div className="bg-card border-border flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border px-4 py-2.5 text-sm">
          {summary.totals.map((b) => (
            <span key={b.currency} className="flex items-baseline gap-1">
              <span className="font-semibold tabular-nums">
                {formatCurrency(b.monthly, b.currency)}/mo
              </span>
              <span className="text-muted-foreground text-xs">{b.currency}</span>
            </span>
          ))}
          <span className="text-muted-foreground ml-auto text-xs">
            {summary.active}/{summary.total} active
          </span>
        </div>
      )}

      {/* ── Google integrations ── */}
      <GoogleIntegrationButtons layout="row" />

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendor, category, or group…"
          className="h-9 pl-9"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── GROUPS VIEW ── */}
      {view === "groups" && (
        <div className="flex flex-col gap-2">
          {grouped.map((group) => {
            const isOpen = expanded[group.groupId] ?? true;
            const color = colorMap.get(group.groupId) ?? "#6d5df6";
            const activeCount = group.subs.filter((s) => s.status === "active").length;
            const groupBuckets = calculateTotalsByCurrency(
              group.subs.map((s) => ({
                amount: s.amount,
                cadence: s.cadence,
                status: s.status,
                currency: s.currency,
                termEndDateYmd: s.end_date,
              }))
            );
            const totalsInline =
              groupBuckets.length > 0
                ? groupBuckets.map((b) => `${formatCurrency(b.monthly, b.currency)}/mo`).join(" · ")
                : null;

            return (
              <div
                key={group.groupId}
                ref={(el: HTMLDivElement | null) => {
                  groupRefs.current[group.groupId] = el;
                }}
                className="bg-card border-border overflow-hidden rounded-xl border"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                {/* Group header */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() =>
                      setExpanded((p) => ({
                        ...p,
                        [group.groupId]: !isOpen,
                      }))
                    }
                  >
                    <span className="leading-none font-semibold">{group.groupName}</span>
                    {totalsInline && (
                      <span className="text-muted-foreground hidden truncate text-xs sm:inline">
                        {totalsInline}
                      </span>
                    )}
                    <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
                      {group.subs.length} · {activeCount} active
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      onClick={() => openAdd(group.groupId)}
                      title="Add subscription"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent flex size-7 items-center justify-center rounded-md transition-colors">
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => router.push(`/calendar?groupId=${group.groupId}`)}
                        >
                          <CalendarDays className="size-4" />
                          Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => router.push(`/reports?groupId=${group.groupId}`)}
                        >
                          <BarChart2 className="size-4" />
                          Reports
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            const g = groups.find((x) => x.id === group.groupId);
                            if (g) {
                              setEditGroupRow(g);
                              setEditGroupName(g.name);
                              setManageOpen(true);
                            }
                          }}
                        >
                          <Pencil className="size-4" />
                          Rename group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors"
                      onClick={() =>
                        setExpanded((p) => ({
                          ...p,
                          [group.groupId]: !isOpen,
                        }))
                      }
                    >
                      {isOpen ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Subscription rows */}
                {isOpen && (
                  <div className="border-t">
                    {group.subs.length === 0 ? (
                      <p className="text-muted-foreground px-4 py-2.5 text-sm">
                        No subscriptions.{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => openAdd(group.groupId)}
                        >
                          Add one
                        </button>
                      </p>
                    ) : (
                      group.subs.map((sub, idx) => {
                        const dot =
                          sub.status === "active"
                            ? "bg-[#1faa6b]"
                            : sub.status === "paused"
                              ? "bg-[#e8843c]"
                              : "bg-muted-foreground/40";
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => openEdit(group.groupId, sub)}
                            className={cn(
                              "hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-1.5 text-left text-sm transition-colors",
                              idx < group.subs.length - 1 && "border-border/40 border-b"
                            )}
                          >
                            <span className={cn("mt-px h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
                            <span className="flex-1 truncate font-medium">{sub.vendor_name}</span>
                            {sub.category ? (
                              <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                                {sub.category}
                              </span>
                            ) : null}
                            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                              {formatCurrency(Number(sub.amount), sub.currency)}/
                              {cadenceShort(sub.cadence)}
                            </span>
                            <span className="text-muted-foreground hidden shrink-0 text-xs tabular-nums sm:inline">
                              {sub.renewal_date}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {grouped.length === 0 && query && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No subscriptions match &ldquo;{query}&rdquo;.
            </p>
          )}

          {groups.length === 0 && (
            <div className="bg-card border-border flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
              <p className="text-muted-foreground text-sm">No groups yet.</p>
              <Button size="sm" onClick={() => setManageOpen(true)}>
                <Plus className="size-4" />
                Add a group
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          {flatSubs.length === 0 ? (
            <p className="text-muted-foreground px-4 py-10 text-center text-sm">
              {query ? `No matches for "${query}".` : "No subscriptions yet. Add one above."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b text-left">
                  <th className="text-muted-foreground px-4 py-2 text-xs font-medium tracking-wide uppercase">
                    Vendor
                  </th>
                  <th className="text-muted-foreground hidden px-3 py-2 text-xs font-medium tracking-wide uppercase sm:table-cell">
                    Group
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wide uppercase tabular-nums">
                    Amount
                  </th>
                  <th className="text-muted-foreground hidden px-3 py-2 text-xs font-medium tracking-wide uppercase md:table-cell">
                    Cadence
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wide uppercase tabular-nums">
                    Renews
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wide uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {flatSubs.map((sub, idx) => {
                  const g = first(sub.groups);
                  const gColor = g ? (colorMap.get(g.id) ?? "#6d5df6") : "#6d5df6";
                  return (
                    <tr
                      key={sub.id}
                      className={cn(
                        "hover:bg-muted/40 cursor-pointer transition-colors",
                        idx < flatSubs.length - 1 && "border-border/40 border-b"
                      )}
                      onClick={() => openEdit(g?.id ?? "", sub)}
                    >
                      <td className="px-4 py-2 font-medium">{sub.vendor_name}</td>
                      <td className="hidden px-3 py-2 sm:table-cell">
                        {g ? (
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ background: gColor }}
                          >
                            {g.name}
                          </span>
                        ) : null}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 text-xs tabular-nums">
                        {formatCurrency(Number(sub.amount), sub.currency)}
                      </td>
                      <td className="text-muted-foreground hidden px-3 py-2 capitalize md:table-cell">
                        {sub.cadence}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 text-xs tabular-nums">
                        {sub.renewal_date}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={sub.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ADD SUBSCRIPTION ── */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setReceiptFileName(null);
            setExtractHints([]);
          }
        }}
      >
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>Add subscription</DialogTitle>
            <DialogDescription>Fill manually or upload a receipt to auto-fill.</DialogDescription>
          </DialogHeader>

          {/* Receipt upload */}
          <div className="border-border rounded-lg border border-dashed px-3 py-2.5">
            {extracting ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="text-primary size-4 animate-spin" />
                <span>Reading receipt…</span>
              </div>
            ) : receiptFileName ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <Sparkles className="text-primary size-4 shrink-0" />
                  <span className="truncate">
                    Auto-filled from <span className="font-medium">{receiptFileName}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => {
                    setReceiptFileName(null);
                    setExtractHints([]);
                  }}
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                  Upload a receipt or invoice to auto-fill the form
                </p>
                <label className="cursor-pointer">
                  <input
                    ref={receiptInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleReceiptFile(file);
                      e.target.value = "";
                    }}
                  />
                  <span className="text-primary flex items-center gap-1 text-xs hover:underline">
                    <FileUp className="size-3.5" />
                    Upload receipt
                  </span>
                </label>
              </div>
            )}
            {extractHints.length > 0 && (
              <p className="text-muted-foreground mt-1.5 text-xs">{extractHints[0]}</p>
            )}
          </div>

          {subFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving || extracting || !formGroupId || !vendor.trim() || !renewalDate}
              onClick={() => void createSub()}
            >
              {saving ? "Saving…" : "Save subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT SUBSCRIPTION ── */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setDeleteSubOpen(false);
        }}
      >
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
          </DialogHeader>
          {subFormFields}
          <DialogFooter className="flex flex-row flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 shrink-0 px-2 text-xs font-normal"
              onClick={() => setDeleteSubOpen(true)}
            >
              Delete subscription…
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={saving || !formGroupId || !vendor.trim() || !renewalDate}
                onClick={() => void updateSub()}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE SUB CONFIRM ── */}
      <Dialog open={deleteSubOpen} onOpenChange={setDeleteSubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete subscription?</DialogTitle>
            <DialogDescription>
              Permanently removes{" "}
              <span className="text-foreground font-medium">
                {vendor.trim() || "this subscription"}
              </span>
              . Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSubOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={saving} onClick={() => void deleteSub()}>
              {saving ? "Deleting…" : "Delete subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MANAGE GROUPS ── */}
      <Dialog
        open={manageOpen}
        onOpenChange={(o) => {
          setManageOpen(o);
          if (!o) {
            setEditGroupRow(null);
            setDeleteGroupId(null);
            setDeleteGroupConfirm("");
            setAddGroupOpen(false);
            setNewGroupName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage groups</DialogTitle>
            <DialogDescription>Rename, delete, or add groups.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-0.5 py-1">
            {groups.map((g, i) => {
              const color = GROUP_COLORS[i % GROUP_COLORS.length] ?? GROUP_COLORS[0];
              const isEditing = editGroupRow?.id === g.id;
              return (
                <div
                  key={g.id}
                  className="hover:bg-muted/40 flex items-center gap-2 rounded-lg px-2 py-1.5"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                  {isEditing ? (
                    <Input
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="h-7 flex-1 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void updateGroup();
                        if (e.key === "Escape") setEditGroupRow(null);
                      }}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium">{g.name}</span>
                  )}
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={saving || !editGroupName.trim()}
                        onClick={() => void updateGroup()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditGroupRow(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7"
                        onClick={() => {
                          setEditGroupRow(g);
                          setEditGroupName(g.name);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-7"
                        onClick={() => {
                          setDeleteGroupId(g.id);
                          setDeleteGroupConfirm("");
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {groups.length === 0 && (
              <p className="text-muted-foreground py-3 text-center text-sm">No groups yet.</p>
            )}
          </div>

          {addGroupOpen ? (
            <div className="flex flex-col gap-2 border-t pt-3">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") void createGroup();
                  if (e.key === "Escape") {
                    setAddGroupOpen(false);
                    setNewGroupName("");
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={saving || !newGroupName.trim()}
                  onClick={() => void createGroup()}
                >
                  {saving ? "Saving…" : "Create group"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddGroupOpen(false);
                    setNewGroupName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setAddGroupOpen(true)}
              >
                <Plus className="size-4" />
                New group
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DELETE GROUP CONFIRM ── */}
      <Dialog
        open={!!deleteGroupId}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteGroupId(null);
            setDeleteGroupConfirm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete group?</DialogTitle>
            <DialogDescription>
              Removes the group and all its subscriptions. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-1">
            <Label>Type the group name to confirm</Label>
            <p className="text-foreground text-sm font-medium">
              {groups.find((g) => g.id === deleteGroupId)?.name}
            </p>
            <Input
              value={deleteGroupConfirm}
              onChange={(e) => setDeleteGroupConfirm(e.target.value)}
              placeholder={groups.find((g) => g.id === deleteGroupId)?.name ?? ""}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteGroupId(null);
                setDeleteGroupConfirm("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleteGroupConfirm.trim() !==
                (groups.find((g) => g.id === deleteGroupId)?.name ?? "").trim()
              }
              onClick={() => deleteGroupId && void deleteGroup(deleteGroupId)}
            >
              Delete group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── INVOICE GENERATOR ── */}
      <InvoiceGeneratorDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        groups={groups}
        subs={subs}
      />
    </div>
  );
}
