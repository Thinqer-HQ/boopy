"use client";

import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
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
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { canCreateClient, getPlanCapabilities } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type ClientRow = {
  id: string;
  workspace_id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const { state, reload } = usePrimaryWorkspace();
  const billing = useWorkspaceBilling(state.status === "ready" ? state.workspaceId : null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<ClientRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const loadClients = useCallback(async (workspaceId: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setListError(null);
    const { data, error } = await supabase
      .from("clients")
      .select("id, workspace_id, name, notes, created_at")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });
    if (error) {
      setListError(error.message);
      setClients([]);
      return;
    }
    setClients((data ?? []) as ClientRow[]);
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    queueMicrotask(() => {
      void loadClients(state.workspaceId);
    });
  }, [state, loadClients]);

  async function handleAdd() {
    if (state.status !== "ready" || !newName.trim()) return;
    if (!canCreateClient(billing.plan, clients.length)) {
      setListError("Client limit reached on current plan. Upgrade to Pro to add more.");
      setAddOpen(false);
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("clients").insert({
      workspace_id: state.workspaceId,
      name: newName.trim(),
      notes: newNotes.trim() || null,
    });
    setSaving(false);
    if (error) {
      setListError(error.message);
      return;
    }
    setNewName("");
    setNewNotes("");
    setAddOpen(false);
    await loadClients(state.workspaceId);
  }

  async function handleDelete(id: string) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    setDeleteId(null);
    if (error) {
      setListError(error.message);
      return;
    }
    await loadClients(state.workspaceId);
  }

  async function handleSaveEdit() {
    if (!editRow || !editName.trim()) return;
    setSaving(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("clients")
      .update({ name: editName.trim(), notes: editNotes.trim() || null })
      .eq("id", editRow.id);
    setSaving(false);
    if (error) {
      setListError(error.message);
      return;
    }
    setEditRow(null);
    if (state.status === "ready") await loadClients(state.workspaceId);
  }

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }

  if (state.status === "loading") {
    return <div className="text-muted-foreground p-8 text-sm">Loading clients…</div>;
  }

  if (state.status === "error") {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load workspace</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (state.status === "schema_not_ready") {
    return <SchemaNotReady details={state.details} />;
  }

  if (state.status === "empty") {
    return (
      <div className="p-8">
        <Alert>
          <AlertTitle>No workspace yet</AlertTitle>
          <AlertDescription>
            Open the <Link href="/">dashboard</Link> once while signed in so we can create your
            Personal workspace, then return here.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const clientCapabilities = getPlanCapabilities(billing.plan);
  const clientLimitReached = !canCreateClient(billing.plan, clients.length);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Agencies manage one row per client; subscriptions live under each client.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add client
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        Plan: <span className="font-medium uppercase">{billing.plan}</span> • {clients.length}/
        {clientCapabilities.maxClients >= 100000 ? "Unlimited" : clientCapabilities.maxClients}{" "}
        clients
      </p>

      {listError ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      ) : null}

      {clientLimitReached ? (
        <Alert>
          <AlertTitle>Client limit reached</AlertTitle>
          <AlertDescription>
            Upgrade your plan in <Link href="/settings/billing">billing settings</Link> to add more
            clients.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground size-5" />
            <CardTitle>All clients</CardTitle>
          </div>
          <CardDescription>
            {clients.length} client{clients.length === 1 ? "" : "s"} in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-4">
          {clients.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm sm:px-0">
              No clients yet. Add your first client to start tracking subscriptions.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clients/${c.id}`} className="text-primary hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden max-w-xs truncate md:table-cell">
                      {c.notes ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "size-8"
                          )}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/clients/${c.id}`)}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setEditRow(c);
                              setEditName(c.name);
                              setEditNotes(c.notes ?? "");
                            }}
                          >
                            <Pencil className="size-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onClick={() => setDeleteId(c.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
            <DialogDescription>
              A client is a billable account or customer you track subscriptions for.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-notes">Notes (optional)</Label>
              <Textarea
                id="client-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving || !newName.trim() || clientLimitReached}
              onClick={() => void handleAdd()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)}>
              Cancel
            </Button>
            <Button disabled={saving || !editName.trim()} onClick={() => void handleSaveEdit()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
            <DialogDescription>
              This removes the client and all subscriptions under it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && void handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
