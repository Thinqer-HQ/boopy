"use client";

import { Download, Loader2, Scale, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getSupabaseBrowser } from "@/lib/supabase/browser";

async function getToken(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function AccountPrivacyPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExport() {
    const token = await getToken();
    if (!token) {
      setExportError("Sign in again to export data.");
      return;
    }
    setExporting(true);
    setExportError(null);
    const res = await fetch("/api/account/export", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExporting(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setExportError(p.error ?? "Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boopy-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    const token = await getToken();
    if (!token) {
      setDeleteError("Sign in again to delete your account.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(false);
    if (!res.ok) {
      const p = (await res.json().catch(() => ({}))) as { error?: string };
      setDeleteError(p.error ?? "Deletion failed.");
      return;
    }
    // Sign out and go to marketing site
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Account & Privacy</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal data in accordance with GDPR and global privacy standards.
        </p>
      </div>

      {/* Compliance summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="text-primary size-4" />
            Your privacy rights
          </CardTitle>
          <CardDescription>
            Boopy complies with the General Data Protection Regulation (GDPR) and similar laws.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>
              <span className="text-foreground font-medium">Right of Access (Art. 15)</span> —
              Download all data we hold about you below.
            </li>
            <li>
              <span className="text-foreground font-medium">Right to Portability (Art. 20)</span> —
              Your export is in machine-readable JSON format.
            </li>
            <li>
              <span className="text-foreground font-medium">Right to Erasure (Art. 17)</span> —
              Delete your account to permanently remove all data from our systems.
            </li>
            <li>
              <span className="text-foreground font-medium">Right to Rectification (Art. 16)</span>{" "}
              — Update your workspace name and subscription details at any time.
            </li>
            <li>
              <span className="text-foreground font-medium">Lawful basis</span> — We process your
              data under contract (GDPR Art. 6(1)(b)) to deliver the Boopy service.
            </li>
            <li>
              <span className="text-foreground font-medium">Data minimisation</span> — We only
              collect what is necessary to track subscriptions and send you reminders.
            </li>
            <li>
              <span className="text-foreground font-medium">Sub-processors</span> — Supabase
              (database), Stripe (payments), Resend (email), PostHog (analytics), Google (OAuth /
              Drive / Calendar). Each has its own DPA and GDPR commitments.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4" />
            Export my data
          </CardTitle>
          <CardDescription>
            Download a JSON file containing all data Boopy holds about your account: workspaces,
            groups, subscriptions, billing plan, and integration metadata. No OAuth tokens are
            included.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exportError && (
            <Alert variant="destructive">
              <AlertTitle>Export failed</AlertTitle>
              <AlertDescription>{exportError}</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" disabled={exporting} onClick={() => void handleExport()}>
            {exporting ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-3.5" />
            )}
            {exporting ? "Preparing export…" : "Download data export"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center gap-2 text-base">
            <Trash2 className="size-4" />
            Delete account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
            Your Stripe subscription will be cancelled immediately and no further charges will be
            made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              setDeleteOpen(true);
              setDeleteConfirm("");
              setDeleteError(null);
            }}
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      {/* Legal documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-4" />
            Legal documents
          </CardTitle>
          <CardDescription>
            Read our policies to understand how we collect, use, and protect your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a
            href="https://www.useboopy.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            Privacy Policy
          </a>
          <span className="text-muted-foreground text-sm">·</span>
          <a
            href="https://www.useboopy.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            Terms of Service
          </a>
          <span className="text-muted-foreground text-sm">·</span>
          <a
            href="https://www.useboopy.com/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            Cookie Policy
          </a>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription>
              This will erase your workspace, all groups, all subscriptions, all documents, your
              billing record, and your login credentials. Your Stripe subscription will be
              cancelled. <strong>This cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              autoComplete="off"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={deleting}
              placeholder="DELETE"
            />
          </div>
          {deleteError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || deleteConfirm !== "DELETE"}
              onClick={() => void handleDelete()}
            >
              {deleting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              {deleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
