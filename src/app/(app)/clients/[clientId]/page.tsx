"use client";

import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { canCreateSubscription, getPlanCapabilities } from "@/lib/billing/plan";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Cadence = "monthly" | "yearly" | "custom";
type SubStatus = "active" | "paused" | "cancelled";

type SubscriptionRow = {
  id: string;
  client_id: string;
  vendor_name: string;
  amount: string | number;
  currency: string;
  cadence: Cadence;
  renewal_date: string;
  status: SubStatus;
  category: string | null;
  notes: string | null;
};

type ClientRow = { id: string; name: string; workspace_id: string };

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = typeof params.clientId === "string" ? params.clientId : "";

  const [client, setClient] = useState<ClientRow | null>(null);
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubStatus>("active");
  const [saving, setSaving] = useState(false);

  const [editRow, setEditRow] = useState<SubscriptionRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const billing = useWorkspaceBilling(client?.workspace_id ?? null);

  const load = useCallback(async () => {
    if (!isSupabaseBrowserConfigured() || !clientId) {
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
    const { data: c, error: ce } = await supabase
      .from("clients")
      .select("id, name, workspace_id")
      .eq("id", clientId)
      .maybeSingle();
    if (ce || !c) {
      setError(ce?.message ?? "Client not found.");
      setClient(null);
      setSubs([]);
      setLoading(false);
      return;
    }
    setClient(c as ClientRow);
    const { data: rows, error: se } = await supabase
      .from("subscriptions")
      .select(
        "id, client_id, vendor_name, amount, currency, cadence, renewal_date, status, category, notes"
      )
      .eq("client_id", clientId)
      .order("renewal_date", { ascending: true });
    if (se) {
      setError(se.message);
      setSubs([]);
    } else {
      setSubs((rows ?? []) as SubscriptionRow[]);
    }
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  function openAdd() {
    setVendor("");
    setAmount("");
    setCurrency("USD");
    setCadence("monthly");
    setRenewalDate("");
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
    setCategory(row.category ?? "");
    setNotes(row.notes ?? "");
    setStatus(row.status);
  }

  async function insertSubscription() {
    if (!clientId || !vendor.trim() || !renewalDate) return;
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
      client_id: clientId,
      vendor_name: vendor.trim(),
      amount: amt,
      currency: cur,
      cadence,
      renewal_date: renewalDate,
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
  }

  async function updateSubscription() {
    if (!editRow || !vendor.trim() || !renewalDate) return;
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
  }

  async function removeSubscription(id: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error: de } = await supabase.from("subscriptions").delete().eq("id", id);
    setDeleteId(null);
    if (de) {
      setError(de.message);
      return;
    }
    await load();
  }

  if (!isSupabaseBrowserConfigured()) {
    return <MissingSupabaseConfig />;
  }

  if (loading) {
    return <div className="text-muted-foreground p-8 text-sm">Loading…</div>;
  }

  if (error && !client) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link
          href="/clients"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          Back to clients
        </Link>
      </div>
    );
  }

  const formDialog = (
    <>
      <div className="grid gap-4 py-2">
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
            />
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
    </>
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
            href="/clients"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground w-fit gap-1 px-0"
            )}
          >
            <ArrowLeft className="size-4" />
            Clients
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {client?.name ?? "Client"}
          </h1>
          <p className="text-muted-foreground text-sm">Subscriptions for this client.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Add subscription
        </Button>
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

      {error && client ? (
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
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.vendor_name}</TableCell>
                    <TableCell>
                      {typeof s.amount === "number" ? s.amount.toFixed(2) : s.amount} {s.currency}
                    </TableCell>
                    <TableCell className="hidden capitalize sm:table-cell">{s.cadence}</TableCell>
                    <TableCell>{s.renewal_date}</TableCell>
                    <TableCell className="hidden md:table-cell">{s.status}</TableCell>
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
                          <DropdownMenuItem className="gap-2" onClick={() => openEdit(s)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setDeleteId(s.id)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add subscription</DialogTitle>
            <DialogDescription>Track a recurring charge for this client.</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
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
