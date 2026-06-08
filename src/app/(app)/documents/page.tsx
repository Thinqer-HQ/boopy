"use client";

import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CandidateReview } from "@/components/boopy/documents/candidate-review";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { getPlanCapabilities } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type GroupRow = { id: string; name: string };
type DocumentRow = {
  id: string;
  original_filename: string;
  parse_status: "pending" | "processing" | "parsed" | "failed";
  parse_error: string | null;
  created_at: string;
};
type CandidateRow = {
  id: string;
  group_id: string | null;
  vendor_name: string | null;
  amount: number | null;
  currency: string | null;
  cadence: "monthly" | "yearly" | "quarterly" | "custom" | null;
  renewal_date: string | null;
  confidence: number;
  status: "pending" | "confirmed" | "rejected";
};

const STALE_MS = 3 * 60 * 1000;

function isStaleInFlight(doc: DocumentRow) {
  if (doc.parse_status !== "pending" && doc.parse_status !== "processing") return false;
  return Date.now() - new Date(doc.created_at).getTime() > STALE_MS;
}

export default function DocumentsPage() {
  const { state } = usePrimaryWorkspace();
  const billing = useWorkspaceBilling(state.status === "ready" ? state.workspaceId : null);
  const capabilities = getPlanCapabilities(billing.plan);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const pendingCandidates = candidates.filter((c) => c.status === "pending");

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const staleDocuments = documents.filter(isStaleInFlight);

  const load = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const [groupsRes, docsRes, candidatesRes] = await Promise.all([
      supabase
        .from("groups")
        .select("id, name")
        .eq("workspace_id", state.workspaceId)
        .order("name"),
      supabase
        .from("documents")
        .select("id, original_filename, parse_status, parse_error, created_at")
        .eq("workspace_id", state.workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("parsed_subscription_candidates")
        .select(
          "id, group_id, vendor_name, amount, currency, cadence, renewal_date, confidence, status"
        )
        .eq("workspace_id", state.workspaceId)
        .order("created_at", { ascending: false }),
    ]);
    if (groupsRes.error || docsRes.error || candidatesRes.error) {
      setError(
        groupsRes.error?.message ??
          docsRes.error?.message ??
          candidatesRes.error?.message ??
          "Failed loading."
      );
      return;
    }
    setGroups((groupsRes.data ?? []) as GroupRow[]);
    setDocuments((docsRes.data ?? []) as DocumentRow[]);
    setCandidates((candidatesRes.data ?? []) as CandidateRow[]);
    setError(null);
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const hasInFlight = documents.some(
      (d) => d.parse_status === "pending" || d.parse_status === "processing"
    );
    const timer = setInterval(() => void load(), hasInFlight ? 2000 : 8000);
    return () => clearInterval(timer);
  }, [documents, load, state.status]);

  const getAuthHeader = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  async function uploadAndParseSingle(
    file: File,
    headers: Record<string, string>
  ): Promise<{ ok: boolean; error?: string }> {
    if (state.status !== "ready") return { ok: false, error: "Workspace not ready." };
    const form = new FormData();
    form.append("workspaceId", state.workspaceId);
    form.append("file", file);
    const uploadRes = await fetch("/api/documents/upload", { method: "POST", headers, body: form });
    const uploadJson = (await uploadRes.json()) as { error?: string; document?: { id: string } };
    if (!uploadRes.ok || !uploadJson.document)
      return { ok: false, error: uploadJson.error ?? "Upload failed." };

    const parseRes = await fetch("/api/documents/parse", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, documentId: uploadJson.document.id }),
    });
    const parseJson = (await parseRes.json()) as { error?: string };
    if (!parseRes.ok) return { ok: false, error: parseJson.error ?? "Parse failed." };
    return { ok: true };
  }

  async function uploadFiles(files: File[]) {
    if (state.status !== "ready" || files.length === 0) return;
    if (files.length > capabilities.maxDocumentBatchUpload) {
      setError(
        billing.plan === "free"
          ? "Batch upload is a PRO feature. Free plan: one file at a time."
          : `Batch upload is limited to ${capabilities.maxDocumentBatchUpload} files per run.`
      );
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    setProcessingLabel(
      files.length > 1 ? `Uploading ${files.length} files…` : `Uploading ${files[0]?.name}…`
    );
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Please sign in again.");
      setBusy(false);
      return;
    }
    let ok = 0;
    const failures: string[] = [];
    for (const [i, file] of files.entries()) {
      setProcessingLabel(`Processing ${i + 1}/${files.length}: ${file.name}`);
      const res = await uploadAndParseSingle(file, headers);
      if (res.ok) ok++;
      else failures.push(`${file.name}: ${res.error ?? "error"}`);
    }
    setBusy(false);
    setProcessingLabel(ok > 0 ? "Upload complete." : "Upload failed.");
    if (failures.length > 0) setError(failures.slice(0, 2).join(" · "));
    if (ok > 0)
      setMessage(
        ok === 1 ? "Receipt processed. Review candidate below." : `${ok} files processed.`
      );
    await load();
  }

  async function rejectCandidate(candidateId: string) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    const res = await fetch("/api/documents/parse", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, candidateId, action: "reject" }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not reject.");
      return;
    }
    setMessage("Candidate rejected.");
    await load();
  }

  async function confirmCandidate(payload: {
    candidateId: string;
    groupId: string;
    vendorName: string;
    amount: number;
    currency: string;
    cadence: "monthly" | "yearly" | "quarterly" | "custom";
    renewalDate: string;
  }) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    const res = await fetch("/api/documents/parse", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, action: "confirm", ...payload }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not confirm.");
      return;
    }
    setMessage("Subscription created.");
    await load();
  }

  async function retryParse(documentId: string) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    setBusy(true);
    setProcessingLabel("Retrying…");
    const res = await fetch("/api/documents/parse", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, documentId }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Retry failed.");
      return;
    }
    setMessage("Parse retried.");
    await load();
  }

  async function retryStale() {
    if (state.status !== "ready" || !staleDocuments.length) return;
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Please sign in again.");
      return;
    }
    setBusy(true);
    let retried = 0;
    for (const [i, doc] of staleDocuments.entries()) {
      setProcessingLabel(`Retrying ${i + 1}/${staleDocuments.length}: ${doc.original_filename}`);
      const res = await fetch("/api/documents/parse", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: state.workspaceId, documentId: doc.id }),
      });
      if (res.ok) retried++;
    }
    setBusy(false);
    setMessage(`Retried ${retried}/${staleDocuments.length} stuck file(s).`);
    await load();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) void uploadFiles(files);
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready")
    return <div className="text-muted-foreground p-8 text-sm">Loading uploads…</div>;

  const processingCount = documents.filter(
    (d) => d.parse_status === "pending" || d.parse_status === "processing"
  ).length;
  const failedCount = documents.filter((d) => d.parse_status === "failed").length;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Uploads</h1>
          <p className="text-muted-foreground text-sm">
            Receipt and invoice processing queue. Upload receipts when adding subscriptions, or drop
            files here for bulk processing.
          </p>
        </div>
        <Link
          href="/subscriptions"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← Back to subscriptions
        </Link>
      </div>

      {/* ── Stat strip ── */}
      <div className="bg-card border-border flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border px-4 py-2.5 text-sm">
        <span className="flex items-center gap-1.5">
          <Loader2
            className={cn("size-3.5", processingCount > 0 && "animate-spin text-amber-500")}
          />
          <span className="font-semibold tabular-nums">{processingCount}</span>
          <span className="text-muted-foreground text-xs">processing</span>
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle
            className={cn(
              "size-3.5",
              failedCount > 0 ? "text-red-500" : "text-muted-foreground/40"
            )}
          />
          <span className="font-semibold tabular-nums">{failedCount}</span>
          <span className="text-muted-foreground text-xs">failed</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="font-semibold tabular-nums">{pendingCandidates.length}</span>
          <span className="text-muted-foreground text-xs">pending review</span>
        </span>
        <span className="ml-auto">
          <Badge variant={billing.plan === "pro" ? "secondary" : "outline"} className="text-xs">
            {billing.plan === "pro" ? "PRO — batch enabled" : "FREE — single file"}
          </Badge>
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert>
          <AlertTitle>Done</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {staleDocuments.length > 0 && (
        <Alert>
          <AlertTitle>Stuck processing detected</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {staleDocuments.length} file{staleDocuments.length !== 1 ? "s" : ""} stuck in
              processing.
            </span>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void retryStale()}>
              <RefreshCw className="size-3.5" />
              Retry stuck
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !busy && fileInputRef.current?.click()}
        className={cn(
          "border-border flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "hover:bg-muted/30",
          busy && "cursor-default opacity-60"
        )}
      >
        <Upload className="text-muted-foreground size-7" />
        <div>
          <p className="text-sm font-medium">
            {busy ? (processingLabel ?? "Processing…") : "Drop receipts or invoices here"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {billing.plan === "pro"
              ? `Up to ${capabilities.maxDocumentBatchUpload} files per batch · PDF, PNG, JPG, WebP`
              : "One file at a time · PDF, PNG, JPG, WebP · "}
            {billing.plan !== "pro" && (
              <Link
                href="/settings/billing"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Upgrade for batch
              </Link>
            )}
          </p>
        </div>
        {busy && <Loader2 className="text-primary size-5 animate-spin" />}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={billing.plan === "pro"}
          accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void uploadFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* ── Document list ── */}
      {documents.length > 0 && (
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <div className="border-b px-4 py-2.5">
            <h2 className="text-sm font-semibold">Recent uploads</h2>
          </div>
          {documents.map((doc, idx) => {
            const stale = isStaleInFlight(doc);
            return (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm",
                  idx < documents.length - 1 && "border-border/40 border-b"
                )}
              >
                <span className="flex-1 truncate text-sm">{doc.original_filename}</span>
                {doc.parse_status === "processing" || doc.parse_status === "pending" ? (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Loader2 className="size-3.5 animate-spin" />
                    Processing
                  </span>
                ) : doc.parse_status === "parsed" ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="size-3.5" />
                    Failed
                  </span>
                )}
                {(doc.parse_status === "failed" || stale) && (
                  <button
                    className="text-primary flex items-center gap-1 text-xs hover:underline"
                    onClick={() => void retryParse(doc.id)}
                  >
                    <RefreshCw className="size-3" />
                    {stale ? "Retry (stuck)" : "Retry"}
                  </button>
                )}
                {doc.parse_status === "failed" && doc.parse_error && (
                  <span
                    className="text-muted-foreground max-w-[180px] truncate text-xs"
                    title={doc.parse_error}
                  >
                    {doc.parse_error}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pending candidates ── */}
      {pendingCandidates.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Review extracted subscriptions ({pendingCandidates.length})
          </h2>
          {pendingCandidates.map((c) => (
            <CandidateReview
              key={c.id}
              candidate={c}
              groups={groups}
              onConfirm={confirmCandidate}
              onReject={rejectCandidate}
            />
          ))}
        </div>
      )}

      {documents.length === 0 && pendingCandidates.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No uploads yet. Drop a receipt above, or upload from the Add subscription dialog.
        </p>
      )}
    </div>
  );
}
