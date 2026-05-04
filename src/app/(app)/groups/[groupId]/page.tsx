"use client";

import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getCurrencyOptions } from "@/lib/currencies";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { canCreateSubscription, getPlanCapabilities } from "@/lib/billing/plan";
import { calculateTotalsByCurrency, formatCurrency } from "@/lib/reports/spend";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Cadence = "monthly" | "yearly" | "quarterly" | "custom";
type SubStatus = "active" | "paused" | "cancelled";

type SubscriptionRow = {
  id: string;
  group_id: string;
  vendor_name: string;
  amount: string | number;
  currency: string;
  cadence: Cadence;
  renewal_date: string;
  start_date: string | null;
  end_date: string | null;
  status: SubStatus;
  category: string | null;
  notes: string | null;
};

type GroupRow = { id: string; name: string; workspace_id: string };

function termDateError(startYmd: string, endYmd: string): string | null {
  const s = startYmd.trim();
  const e = endYmd.trim();
  if (!s || !e) return null;
  if (e < s) return "End date must be on or after the start date.";
  return null;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  const [group, setGroup] = useState<GroupRow | null>(null);
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubStatus>("active");
  const [saving, setSaving] = useState(false);

  const [editRow, setEditRow] = useState<SubscriptionRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const billing = useWorkspaceBilling(group?.workspace_id ?? null);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  const totalsByCurrency = useMemo(
    () =>
      calculateTotalsByCurrency(
        subs.map((sub) => ({
          amount: sub.amount,
          cadence: sub.cadence,
          status: sub.status,
          currency: sub.currency,
          termEndDateYmd: sub.end_date,
        }))
      ),
    [subs]
  );

  const load = useCallback(async () => {
    if (!isSupabaseBrowserConfigured() || !groupId) {
      setLoading(false);
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    const { data: g, error: ge } = await supabase
      .from("groups")
      .select("id, name, workspace_id")
      .eq("id", groupId)
      .maybeSingle();
    if (ge || !g) {
      setError(ge?.message ?? "Group not found.");
      setGroup(null);
      setSubs([]);
      setLoading(false);
      return;
    }
    setGroup(g as GroupRow);
    const { data: workspaceDefaults } = await supabase
      .from("workspaces")
      .select("default_currency")
      .eq("id", g.workspace_id)
      .maybeSingle();
    setDefaultCurrency(workspaceDefaults?.default_currency ?? "USD");
    const { data: rows, error: se } = await supabase
      .from("subscriptions")
      .select(
        "id, group_id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, category, notes"
      )
      .eq("group_id", groupId)
      .order("renewal_date", { ascending: true });
    if (se) {
      setError(se.message);
      setSubs([]);
    } else {
      const nextRows = (rows ?? []) as SubscriptionRow[];
      setSubs(nextRows);

      const editSubscriptionId = searchParams.get("editSubscriptionId");
      if (editSubscriptionId) {
        const matched = nextRows.find((row) => row.id === editSubscriptionId);
        if (matched) {
          setEditRow(matched);
          setVendor(matched.vendor_name);
          setAmount(String(matched.amount));
          setCurrency(matched.currency);
          setCadence(matched.cadence);
          setRenewalDate(matched.renewal_date);
          setStartDate(matched.start_date ?? "");
          setEndDate(matched.end_date ?? "");
          setCategory(matched.category ?? "");
          setNotes(matched.notes ?? "");
          setStatus(matched.status);

          const nextParams = new URLSearchParams(searchParams.toString());
          nextParams.delete("editSubscriptionId");
          const query = nextParams.toString();
          router.replace(`/groups/${groupId}${query ? `?${query}` : ""}`);
        }
      }
    }
    setLoading(false);
  }, [groupId, router, searchParams]);

  async function maybeSyncGoogleCalendar(workspaceId: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data: connected } = await supabase
      .from("calendar_integrations")
      .select("workspace_id")
      .eq("workspace_id", workspaceId)
      .eq("provider", "google")
      .maybeSingle();
    if (!connected) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const response = await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId, scope: "all" }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      console.warn("Calendar sync failed:", payload.error ?? response.status);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  function openAdd() {
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
    setAddOpen(true);
  }

  function openEdit(row: SubscriptionRow) {
    setEditRow(row);
    setVendor(row.vendor_name);
    setAmount(String(row.amount));
    setCurrency(row.currency);
    setCadence(row.cadence);
    setRenewalDate(row.renewal_date);
    setStartDate(row.start_date ?? "");
    setEndDate(row.end_date ?? "");
    setCategory(row.category ?? "");
    setNotes(row.notes ?? "");
    setStatus(row.status);
  }

  async function insertSubscription() {
    if (!groupId || !vendor.trim() || !renewalDate) return;
    const td = termDateError(startDate, endDate);
    if (td) {
      setError(td);
      return;
    }
    if (!canCreateSubscription(billing.plan, subs.length)) {
      setError("Subscription limit reached on current plan. Upgrade to Pro to add more.");
      setAddOpen(false);
      return;
    }
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const cur = currency.trim().toUpperCase();
    if (cur.length < 3) {
      setError("Currency must be at least 3 characters (e.g. USD).");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error: ie } = await supabase.from("subscriptions").insert({
      group_id: groupId,
      vendor_name: vendor.trim(),
      amount: amt,
      currency: cur,
      cadence,
      renewal_date: renewalDate,
      start_date: startDate.trim() || null,
      end_date: endDate.trim() || null,
      status,
      category: category.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (ie) {
      setError(ie.message);
      return;
    }
    setAddOpen(false);
    setEditRow(null);
    await load();
    if (group) await maybeSyncGoogleCalendar(group.workspace_id);
  }

  async function updateSubscription() {
    if (!editRow || !vendor.trim() || !renewalDate) return;
    const td = termDateError(startDate, endDate);
    if (td) {
      setError(td);
      return;
    }
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    const cur = currency.trim().toUpperCase();
    if (cur.length < 3) {
      setError("Currency must be at least 3 characters (e.g. USD).");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error: ue } = await supabase
      .from("subscriptions")
      .update({
        vendor_name: vendor.trim(),
        amount: amt,
        currency: cur,
        cadence,
        renewal_date: renewalDate,
        start_date: startDate.trim() || null,
        end_date: endDate.trim() || null,
        status,
        category: category.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", editRow.id);
    setSaving(false);
    if (ue) {
      setError(ue.message);
      return;
    }
    setEditRow(null);
    await load();
    if (group) await maybeSyncGoogleCalendar(group.workspace_id);
  }

  async function removeSubscription(id: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      setDeleteId(null);
      return;
    }
    const workspaceId = group?.workspace_id;
    setDeleteId(null);

    const response = await fetch(`/api/subscriptions/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not delete subscription.");
      return;
    }
    await load();
    if (workspaceId) await maybeSyncGoogleCalendar(workspaceId);
  }

  if (!isSupabaseBrowserConfigured()) {
    return <MissingSupabaseConfig />;
  }

  if (loading) {
    return <div className="text-muted-foreground p-8 text-sm">Loading…</div>;
  }

  if (error && !group) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link
          href="/groups"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          Back to groups
        </Link>
      </div>
    );
  }

  const formDialog = (
    <div className="grid gap-4 pb-4">
      <div className="grid gap-2">
        <Label htmlFor="vendor">Vendor</Label>
        <Input
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="Netflix"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={8}
            list="group-subscription-currencies"
          />
          <datalist id="group-subscription-currencies">
            {currencyOptions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="cadence">Cadence</Label>
          <select
            id="cadence"
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
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SubStatus)}
            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="renewal">Renewal date</Label>
        <Input
          id="renewal"
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sub-start">Start date (optional)</Label>
        <Input
          id="sub-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sub-end">End date (optional)</Label>
        <Input
          id="sub-end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          No billing or reminders after this day (UTC). Leave blank for ongoing.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Software"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sub-notes">Notes (optional)</Label>
        <Textarea
          id="sub-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <p className="text-muted-foreground text-xs">
        Plan: <span className="font-medium uppercase">{billing.plan}</span> • {subs.length}/
        {getPlanCapabilities(billing.plan).maxSubscriptions >= 100000
          ? "Unlimited"
          : getPlanCapabilities(billing.plan).maxSubscriptions}{" "}
        subscriptions
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href="/groups"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground w-fit gap-1 px-0"
            )}
          >
            <ArrowLeft className="size-4" />
            Groups
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {group?.name ?? "Group"}
          </h1>
          <p className="text-muted-foreground text-sm">Subscriptions for this group.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Add subscription
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {totalsByCurrency.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active subscriptions.</p>
              ) : (
                totalsByCurrency.map((bucket) => (
                  <p key={`monthly-${bucket.currency}`} className="font-heading text-xl">
                    {bucket.currency} {formatCurrency(bucket.monthly, bucket.currency)}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Yearly spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {totalsByCurrency.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active subscriptions.</p>
              ) : (
                totalsByCurrency.map((bucket) => (
                  <p key={`yearly-${bucket.currency}`} className="font-heading text-xl">
                    {bucket.currency} {formatCurrency(bucket.yearly, bucket.currency)}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!canCreateSubscription(billing.plan, subs.length) ? (
        <Alert>
          <AlertTitle>Subscription limit reached</AlertTitle>
          <AlertDescription>
            Upgrade your plan in <Link href="/settings/billing">billing settings</Link> to add more
            subscriptions.
          </AlertDescription>
        </Alert>
      ) : null}

      {error && group ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            {subs.length} subscription{subs.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-4">
          {subs.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm sm:px-0">
              No subscriptions yet. Add renewals you want Boopy to remind you about.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Cadence</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Start</TableHead>
                  <TableHead className="hidden lg:table-cell">End</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.vendor_name}</TableCell>
                    <TableCell>
                      {typeof sub.amount === "number" ? sub.amount.toFixed(2) : sub.amount}{" "}
                      {sub.currency}
                    </TableCell>
                    <TableCell className="hidden capitalize sm:table-cell">{sub.cadence}</TableCell>
                    <TableCell>{sub.renewal_date}</TableCell>
                    <TableCell className="hidden md:table-cell">{sub.status}</TableCell>
                    <TableCell className="hidden lg:table-cell">{sub.start_date ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{sub.end_date ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "size-8"
                          )}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openEdit(sub)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setDeleteId(sub.id)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="!flex max-h-[min(90dvh,44rem)] !flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <div className="min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overscroll-contain px-4 pt-4">
            <DialogHeader>
              <DialogTitle>Add subscription</DialogTitle>
              <DialogDescription>Track a recurring charge for this group.</DialogDescription>
            </DialogHeader>
            {formDialog}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                saving ||
                !vendor.trim() ||
                !renewalDate ||
                !canCreateSubscription(billing.plan, subs.length)
              }
              onClick={() => void insertSubscription()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="!flex max-h-[min(90dvh,44rem)] !flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <div className="min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overscroll-contain px-4 pt-4">
            <DialogHeader>
              <DialogTitle>Edit subscription</DialogTitle>
            </DialogHeader>
            {formDialog}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0">
            <Button variant="outline" onClick={() => setEditRow(null)}>
              Cancel
            </Button>
            <Button
              disabled={saving || !vendor.trim() || !renewalDate}
              onClick={() => void updateSubscription()}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete subscription?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && void removeSubscription(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
