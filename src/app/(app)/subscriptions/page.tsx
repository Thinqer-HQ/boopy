"use client";

import { CalendarDays, ChevronDown, ChevronUp, Plus, Search, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrencyOptions } from "@/lib/currencies";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { calculateTotalsByCurrency, formatCurrency } from "@/lib/reports/spend";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number | string;
  currency: string;
  cadence: "monthly" | "yearly" | "quarterly" | "custom";
  renewal_date: string;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "paused" | "cancelled";
  category: string | null;
  notes: string | null;
  groups: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};
type GroupRow = { id: string; name: string; notes: string | null };

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function cadenceLabel(cadence: SubscriptionRow["cadence"]) {
  if (cadence === "monthly") return "Monthly";
  if (cadence === "yearly") return "Yearly";
  if (cadence === "quarterly") return "Quarterly";
  return "Custom";
}

function termDateError(startYmd: string, endYmd: string): string | null {
  const s = startYmd.trim();
  const e = endYmd.trim();
  if (!s || !e) return null;
  if (e < s) return "End date must be on or after the start date.";
  return null;
}

export default function SubscriptionsCardsPage() {
  const router = useRouter();
  const { state } = usePrimaryWorkspace();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cadence, setCadence] = useState<"monthly" | "yearly" | "quarterly" | "custom">("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubscriptionRow["status"]>("active");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupNotes, setNewGroupNotes] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  const load = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const [subsResult, groupsResult, workspaceResult] = await Promise.all([
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
        .order("name", { ascending: true }),
      supabase
        .from("workspaces")
        .select("default_currency")
        .eq("id", state.workspaceId)
        .maybeSingle(),
    ]);

    if (subsResult.error || groupsResult.error || workspaceResult.error) {
      setError(
        subsResult.error?.message ??
          groupsResult.error?.message ??
          workspaceResult.error?.message ??
          "Failed loading data."
      );
      return;
    }
    setError(null);
    setSubs((subsResult.data ?? []) as SubscriptionRow[]);
    setGroups((groupsResult.data ?? []) as GroupRow[]);
    setDefaultCurrency(workspaceResult.data?.default_currency ?? "USD");
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const grouped = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const map = new Map<
      string,
      { groupId: string; groupName: string; notes: string | null; subscriptions: SubscriptionRow[] }
    >();
    for (const group of groups) {
      map.set(group.id, {
        groupId: group.id,
        groupName: group.name,
        notes: group.notes,
        subscriptions: [],
      });
    }
    for (const subscription of subs) {
      const group = first(subscription.groups);
      const groupId = group?.id ?? "unknown";
      const groupName = group?.name ?? "Unknown";
      const searchable =
        `${subscription.vendor_name} ${subscription.category ?? ""} ${groupName}`.toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) {
        continue;
      }
      if (!map.has(groupId)) {
        map.set(groupId, { groupId, groupName, notes: null, subscriptions: [] });
      }
      map.get(groupId)?.subscriptions.push(subscription);
    }
    return Array.from(map.values()).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [groups, subs, query]);

  const allGroups = useMemo(() => {
    return groups.map((group) => ({ id: group.id, name: group.name }));
  }, [groups]);

  const summary = useMemo(() => {
    const active = subs.filter((subscription) => subscription.status === "active").length;
    const totalsByCurrency = calculateTotalsByCurrency(
      subs.map((subscription) => ({
        amount: subscription.amount,
        cadence: subscription.cadence,
        status: subscription.status,
        currency: subscription.currency,
        termEndDateYmd: subscription.end_date,
      }))
    );
    return {
      active,
      total: subs.length,
      totalsByCurrency,
    };
  }, [subs]);

  function formatCurrencyBucketsInline(
    buckets: Array<{ currency: string; monthly: number; yearly: number }>,
    mode: "monthly" | "yearly"
  ) {
    if (buckets.length === 0) return "No active subscriptions";
    return buckets
      .map((bucket) => `${bucket.currency} ${formatCurrency(bucket[mode], bucket.currency)}`)
      .join(" • ");
  }

  function openAddDialog(groupId: string) {
    setSelectedGroupId(groupId);
    setVendor("");
    setAmount("");
    setCurrency(defaultCurrency);
    setCadence("monthly");
    setRenewalDate("");
    setStartDate("");
    setEndDate("");
    setCategory("");
    setNotes("");
    setStatus("active");
    setEditingSubscriptionId(null);
    setAddDialogOpen(true);
  }

  function openEditDialog(groupId: string, subscription: SubscriptionRow) {
    setSelectedGroupId(groupId);
    setVendor(subscription.vendor_name);
    setAmount(String(subscription.amount));
    setCurrency(subscription.currency);
    setCadence(subscription.cadence);
    setRenewalDate(subscription.renewal_date);
    setStartDate(subscription.start_date ?? "");
    setEndDate(subscription.end_date ?? "");
    setCategory(subscription.category ?? "");
    setNotes(subscription.notes ?? "");
    setStatus(subscription.status);
    setEditingSubscriptionId(subscription.id);
    setEditDialogOpen(true);
  }

  async function createSubscription() {
    if (!selectedGroupId || !vendor.trim() || !renewalDate) {
      setError("Group, vendor, and renewal date are required.");
      return;
    }
    const termErr = termDateError(startDate, endDate);
    if (termErr) {
      setError(termErr);
      return;
    }
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const normalizedCurrency = currency.trim().toUpperCase();
    if (normalizedCurrency.length < 3) {
      setError("Currency must be at least 3 characters (e.g. USD).");
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { data: inserted, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        group_id: selectedGroupId,
        vendor_name: vendor.trim(),
        amount: parsedAmount,
        currency: normalizedCurrency,
        cadence,
        renewal_date: renewalDate,
        start_date: startDate.trim() || null,
        end_date: endDate.trim() || null,
        status,
        category: category.trim() || null,
        notes: notes.trim() || null,
      })
      .select(
        "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, category, notes"
      )
      .single();
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setAddDialogOpen(false);
    setError(null);
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    if (inserted) {
      setSubs((current) => [
        ...current,
        {
          ...(inserted as Omit<SubscriptionRow, "groups">),
          groups: selectedGroup
            ? { id: selectedGroup.id, name: selectedGroup.name }
            : { id: selectedGroupId, name: "Unknown" },
        },
      ]);
    } else {
      await load();
    }
  }

  async function createGroup() {
    if (state.status !== "ready" || !newGroupName.trim()) {
      setError("Group name is required.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("groups")
      .insert({
        workspace_id: state.workspaceId,
        name: newGroupName.trim(),
        notes: newGroupNotes.trim() || null,
      })
      .select("id, name, notes")
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setGroups((current) =>
      [...current, data as GroupRow].sort((a, b) => a.name.localeCompare(b.name))
    );
    setSelectedGroupId(data.id);
    setNewGroupName("");
    setNewGroupNotes("");
    setGroupDialogOpen(false);
  }

  async function updateSubscription() {
    if (!editingSubscriptionId || !selectedGroupId || !vendor.trim() || !renewalDate) {
      setError("Group, vendor, and renewal date are required.");
      return;
    }
    const termErr = termDateError(startDate, endDate);
    if (termErr) {
      setError(termErr);
      return;
    }
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const normalizedCurrency = currency.trim().toUpperCase();
    if (normalizedCurrency.length < 3) {
      setError("Currency must be at least 3 characters (e.g. USD).");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        group_id: selectedGroupId,
        vendor_name: vendor.trim(),
        amount: parsedAmount,
        currency: normalizedCurrency,
        cadence,
        renewal_date: renewalDate,
        start_date: startDate.trim() || null,
        end_date: endDate.trim() || null,
        status,
        category: category.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", editingSubscriptionId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSubs((current) =>
      current.map((subscription) =>
        subscription.id === editingSubscriptionId
          ? {
              ...subscription,
              vendor_name: vendor.trim(),
              amount: parsedAmount,
              currency: normalizedCurrency,
              cadence,
              renewal_date: renewalDate,
              start_date: startDate.trim() || null,
              end_date: endDate.trim() || null,
              status,
              category: category.trim() || null,
              notes: notes.trim() || null,
              groups: {
                id: selectedGroupId,
                name: groups.find((group) => group.id === selectedGroupId)?.name ?? "Unknown",
              },
            }
          : subscription
      )
    );
    setEditDialogOpen(false);
    setEditingSubscriptionId(null);
    setError(null);
  }

  async function deleteSubscription() {
    if (!editingSubscriptionId) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", editingSubscriptionId);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSubs((current) =>
      current.filter((subscription) => subscription.id !== editingSubscriptionId)
    );
    setEditDialogOpen(false);
    setEditingSubscriptionId(null);
    setError(null);
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading subscriptions…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">
          Browse every group as an expandable card with full subscription details.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setGroupDialogOpen(true)}>
          <Plus className="size-4" />
          Add group
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total monthly expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-xl">
              {formatCurrencyBucketsInline(summary.totalsByCurrency, "monthly")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projected yearly expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-xl">
              {formatCurrencyBucketsInline(summary.totalsByCurrency, "yearly")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">
              {summary.active}/{summary.total}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by vendor, category, or group..."
          className="pl-9"
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load subscriptions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4">
        {grouped.map((group) => {
          const isOpen = expanded[group.groupId] ?? true;
          const activeCount = group.subscriptions.filter((sub) => sub.status === "active").length;
          return (
            <Card key={group.groupId} className="overflow-visible">
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="w-full min-w-0">
                    {(() => {
                      const groupBuckets = calculateTotalsByCurrency(
                        group.subscriptions.map((subscription) => ({
                          amount: subscription.amount,
                          cadence: subscription.cadence,
                          status: subscription.status,
                          currency: subscription.currency,
                          termEndDateYmd: subscription.end_date,
                        }))
                      );
                      return (
                        <>
                          <CardTitle className="text-lg">
                            <span className="block break-words">{group.groupName}</span>
                            <span className="text-muted-foreground mt-1 block text-sm font-normal sm:mt-0 sm:ml-2 sm:inline">
                              {formatCurrencyBucketsInline(groupBuckets, "monthly")} monthly
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {group.subscriptions.length} subscription
                            {group.subscriptions.length === 1 ? "" : "s"} • {activeCount} active •{" "}
                            {formatCurrencyBucketsInline(groupBuckets, "yearly")} yearly
                          </CardDescription>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex w-full flex-shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 shrink-0 touch-manipulation"
                      onClick={() => router.push(`/calendar?groupId=${group.groupId}`)}
                    >
                      <CalendarDays className="size-4" />
                      Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 shrink-0 touch-manipulation"
                      onClick={() => router.push(`/reports?groupId=${group.groupId}`)}
                    >
                      Reports
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 shrink-0 touch-manipulation"
                      onClick={() => openAddDialog(group.groupId)}
                    >
                      <Plus className="size-4" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 shrink-0 touch-manipulation"
                      onClick={() =>
                        setExpanded((current) => ({ ...current, [group.groupId]: !isOpen }))
                      }
                    >
                      {isOpen ? (
                        <>
                          Collapse <ChevronUp className="size-4" />
                        </>
                      ) : (
                        <>
                          Expand <ChevronDown className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isOpen ? (
                <CardContent className="grid gap-3 pt-4">
                  {group.subscriptions.map((subscription) => (
                    <button
                      key={subscription.id}
                      type="button"
                      className="hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors"
                      onClick={() => openEditDialog(group.groupId, subscription)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{subscription.vendor_name}</p>
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span>
                          {formatCurrency(Number(subscription.amount ?? 0), subscription.currency)}{" "}
                          / {cadenceLabel(subscription.cadence)}
                        </span>
                        <span>Renews: {subscription.renewal_date}</span>
                        <span>
                          Term: {subscription.start_date ? subscription.start_date : "—"}
                          {" → "}
                          {subscription.end_date ?? "open-ended"}
                        </span>
                        <span>Category: {subscription.category ?? "Uncategorized"}</span>
                      </div>
                      {subscription.notes ? (
                        <p className="text-muted-foreground mt-2 text-sm">{subscription.notes}</p>
                      ) : null}
                      <p className="text-primary mt-2 inline-flex items-center gap-1 text-xs">
                        <SquarePen className="size-3" />
                        Open edit view
                      </p>
                    </button>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matching subscriptions</CardTitle>
            <CardDescription>
              Try a different search term or add subscriptions in Groups.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add subscription</DialogTitle>
            <DialogDescription>Create a subscription directly from this view.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="sub-group">Group</Label>
              <select
                id="sub-group"
                value={selectedGroupId}
                onChange={(event) => setSelectedGroupId(event.target.value)}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">Select a group</option>
                {allGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="sub-vendor">Vendor</Label>
              <Input
                id="sub-vendor"
                value={vendor}
                onChange={(event) => setVendor(event.target.value)}
                placeholder="Notion"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-amount">Amount</Label>
              <Input
                id="sub-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-currency">Currency</Label>
              <Input
                id="sub-currency"
                value={currency}
                maxLength={8}
                list="subscription-currencies"
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              />
              <datalist id="subscription-currencies">
                {currencyOptions.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-cadence">Cadence</Label>
              <select
                id="sub-cadence"
                value={cadence}
                onChange={(event) =>
                  setCadence(event.target.value as "monthly" | "yearly" | "quarterly" | "custom")
                }
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-renewal">Renewal date</Label>
              <Input
                id="sub-renewal"
                type="date"
                value={renewalDate}
                onChange={(event) => setRenewalDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-start">Start date (optional)</Label>
              <Input
                id="sub-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                First day this subscription counts (optional).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-end">End date (optional)</Label>
              <Input
                id="sub-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                No billing or reminders after this day (UTC). Leave blank for ongoing.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-status">Status</Label>
              <select
                id="sub-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as SubscriptionRow["status"])}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-category">Category</Label>
              <Input
                id="sub-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Software"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="sub-notes">Notes</Label>
              <Textarea
                id="sub-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving || !selectedGroupId || !vendor.trim() || !renewalDate}
              onClick={() => void createSubscription()}
            >
              {saving ? "Saving..." : "Save subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
            <DialogDescription>
              Update this subscription without leaving the Subscriptions tab.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="edit-sub-group">Group</Label>
              <select
                id="edit-sub-group"
                value={selectedGroupId}
                onChange={(event) => setSelectedGroupId(event.target.value)}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">Select a group</option>
                {allGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="edit-sub-vendor">Vendor</Label>
              <Input
                id="edit-sub-vendor"
                value={vendor}
                onChange={(event) => setVendor(event.target.value)}
                placeholder="Notion"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-amount">Amount</Label>
              <Input
                id="edit-sub-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-currency">Currency</Label>
              <Input
                id="edit-sub-currency"
                value={currency}
                maxLength={8}
                list="subscription-currencies"
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-cadence">Cadence</Label>
              <select
                id="edit-sub-cadence"
                value={cadence}
                onChange={(event) =>
                  setCadence(event.target.value as "monthly" | "yearly" | "quarterly" | "custom")
                }
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-renewal">Renewal date</Label>
              <Input
                id="edit-sub-renewal"
                type="date"
                value={renewalDate}
                onChange={(event) => setRenewalDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-start">Start date (optional)</Label>
              <Input
                id="edit-sub-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-end">End date (optional)</Label>
              <Input
                id="edit-sub-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                No billing or reminders after this day (UTC). Leave blank for ongoing.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-status">Status</Label>
              <select
                id="edit-sub-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as SubscriptionRow["status"])}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sub-category">Category</Label>
              <Input
                id="edit-sub-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Software"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="edit-sub-notes">Notes</Label>
              <Textarea
                id="edit-sub-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="justify-between">
            <Button
              variant="destructive"
              disabled={saving}
              onClick={() => void deleteSubscription()}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={saving || !selectedGroupId || !vendor.trim() || !renewalDate}
                onClick={() => void updateSubscription()}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add group</DialogTitle>
            <DialogDescription>Create a new group without leaving Subscriptions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="group-name-inline">Group name</Label>
              <Input
                id="group-name-inline"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="Operations"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-notes-inline">Notes</Label>
              <Textarea
                id="group-notes-inline"
                rows={3}
                value={newGroupNotes}
                onChange={(event) => setNewGroupNotes(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !newGroupName.trim()} onClick={() => void createGroup()}>
              {saving ? "Saving..." : "Create group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
