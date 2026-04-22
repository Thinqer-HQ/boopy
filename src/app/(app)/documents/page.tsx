"use client";

import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { CandidateReview } from "@/components/boopy/documents/candidate-review";
import { DocumentDropzone } from "@/components/boopy/documents/dropzone";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  cadence: "monthly" | "yearly" | "custom" | null;
  renewal_date: string | null;
  confidence: number;
  status: "pending" | "confirmed" | "rejected";
};

const STALE_PROCESSING_MS = 3 * 60 * 1000;

function isStaleInFlight(document: DocumentRow) {
  if (document.parse_status !== "pending" && document.parse_status !== "processing") return false;
  return Date.now() - new Date(document.created_at).getTime() > STALE_PROCESSING_MS;
}

export default function DocumentsPage() {
  const { state } = usePrimaryWorkspace();
  const billing = useWorkspaceBilling(state.status === "ready" ? state.workspaceId : null);
  const capabilities = getPlanCapabilities(billing.plan);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const pendingCandidates = candidates.filter((candidate) => candidate.status === "pending");

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | null>(null);
  const staleDocuments = documents.filter((document) => isStaleInFlight(document));

  const load = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const [groupsResult, docsResult, candidatesResult] = await Promise.all([
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

    if (groupsResult.error || docsResult.error || candidatesResult.error) {
      setError(
        groupsResult.error?.message ??
          docsResult.error?.message ??
          candidatesResult.error?.message ??
          "Failed loading documents."
      );
      return;
    }
    setGroups((groupsResult.data ?? []) as GroupRow[]);
    setDocuments((docsResult.data ?? []) as DocumentRow[]);
    setCandidates((candidatesResult.data ?? []) as CandidateRow[]);
    setError(null);
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const hasInFlightDocuments = documents.some(
      (document) => document.parse_status === "pending" || document.parse_status === "processing"
    );
    const refreshMs = hasInFlightDocuments ? 2000 : 8000;
    const timer = setInterval(() => {
      void load();
    }, refreshMs);
    return () => {
      clearInterval(timer);
    };
  }, [documents, load, state.status]);

  const getAuthHeader = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : null;
  };

  async function uploadAndParseSingle(
    file: File,
    headers: Record<string, string>
  ): Promise<{ ok: boolean; error?: string }> {
    if (state.status !== "ready") return { ok: false, error: "Workspace not ready." };
    const form = new FormData();
    form.append("workspaceId", state.workspaceId);
    form.append("file", file);
    const uploadRes = await fetch("/api/documents/upload", {
      method: "POST",
      headers,
      body: form,
    });
    const uploadJson = (await uploadRes.json()) as { error?: string; document?: { id: string } };
    if (!uploadRes.ok || !uploadJson.document) {
      return { ok: false, error: uploadJson.error ?? "Upload failed." };
    }

    const parseRes = await fetch("/api/documents/parse", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, documentId: uploadJson.document.id }),
    });
    const parseJson = (await parseRes.json()) as { error?: string };
    if (!parseRes.ok) {
      return { ok: false, error: parseJson.error ?? "Parse failed." };
    }
    return { ok: true };
  }

  async function uploadFiles(files: File[]) {
    if (state.status !== "ready") return;
    if (files.length === 0) return;
    if (files.length > capabilities.maxDocumentBatchUpload) {
      setError(
        billing.plan === "free"
          ? "Batch upload is a PRO feature. Free can upload one document at a time."
          : `Batch upload is limited to ${capabilities.maxDocumentBatchUpload} files per run.`
      );
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    setProcessingLabel(
      files.length > 1 ? `Uploading ${files.length} documents...` : `Uploading ${files[0]?.name}...`
    );
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Please sign in again.");
      setBusy(false);
      return;
    }
    let successCount = 0;
    const failures: string[] = [];
    for (const [index, file] of files.entries()) {
      setProcessingLabel(`Processing ${index + 1}/${files.length}: ${file.name}`);
      const result = await uploadAndParseSingle(file, headers);
      if (result.ok) {
        successCount += 1;
      } else {
        failures.push(`${file.name}: ${result.error ?? "Unknown error"}`);
      }
    }
    setBusy(false);
    setProcessingLabel(successCount > 0 ? "Processing complete." : "Processing failed.");
    if (failures.length > 0) {
      setError(failures.slice(0, 2).join(" | "));
    }
    if (successCount > 0) {
      setMessage(
        successCount === 1
          ? "Invoice/receipt processed. Review the extracted candidate below."
          : `${successCount} documents processed. Review extracted candidates below.`
      );
    }
    await load();
  }

  async function rejectCandidate(candidateId: string) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    const response = await fetch("/api/documents/parse", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, candidateId, action: "reject" }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(json.error ?? "Could not reject candidate.");
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
    cadence: "monthly" | "yearly" | "custom";
    renewalDate: string;
  }) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    const response = await fetch("/api/documents/parse", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: state.workspaceId,
        action: "confirm",
        ...payload,
      }),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(json.error ?? "Could not confirm candidate.");
      return;
    }
    setMessage("Candidate confirmed and subscription created.");
    await load();
  }

  async function retryParse(documentId: string) {
    if (state.status !== "ready") return;
    const headers = await getAuthHeader();
    if (!headers) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    setProcessingLabel("Retrying parse...");
    const response = await fetch("/api/documents/parse", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: state.workspaceId, documentId }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(json.error ?? "Retry parse failed.");
      setProcessingLabel("Processing failed.");
      return;
    }
    setMessage("Parse retried successfully.");
    setProcessingLabel("Processing complete.");
    await load();
  }

  async function retryStaleDocuments() {
    if (state.status !== "ready" || staleDocuments.length === 0) return;
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Please sign in again.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    let retried = 0;
    for (const [index, document] of staleDocuments.entries()) {
      setProcessingLabel(
        `Retrying stale ${index + 1}/${staleDocuments.length}: ${document.original_filename}`
      );
      const response = await fetch("/api/documents/parse", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: state.workspaceId, documentId: document.id }),
      });
      if (response.ok) retried += 1;
    }
    setBusy(false);
    setProcessingLabel("Stale parse retry complete.");
    setMessage(`Retried ${retried}/${staleDocuments.length} stale document(s).`);
    await load();
  }

  function renderStatus(document: DocumentRow) {
    if (document.parse_status === "processing" || document.parse_status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Loader2 className="size-4 animate-spin" />
          Processing
        </span>
      );
    }
    if (document.parse_status === "parsed") {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="size-4" />
          Done
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-red-600">
        <AlertTriangle className="size-4" />
        Failed
      </span>
    );
  }

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }
  if (state.status === "schema_not_ready") {
    return <SchemaNotReady details={state.details} />;
  }
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading documents…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm">
          Drop invoices/receipts, review parser output, and confirm before creating subscriptions.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Document workflow error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Document processing</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Queued/Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {
              documents.filter(
                (document) =>
                  document.parse_status === "pending" || document.parse_status === "processing"
              ).length
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {documents.filter((document) => document.parse_status === "failed").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending review</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{pendingCandidates.length}</CardContent>
        </Card>
      </div>

      {staleDocuments.length > 0 ? (
        <Alert>
          <AlertTitle>Stuck processing detected</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {staleDocuments.length} document{staleDocuments.length === 1 ? "" : "s"} look stuck in
              processing. Retry now.
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void retryStaleDocuments()}
            >
              <RefreshCw className="size-3.5" />
              Retry stale
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <DocumentDropzone
        disabled={busy}
        statusLabel={processingLabel}
        allowMultiple={billing.plan === "pro"}
        onFilesSelected={(files) => void uploadFiles(files)}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant={billing.plan === "pro" ? "secondary" : "outline"}>
          {billing.plan === "pro" ? "PRO: Batch upload enabled" : "FREE: Single upload"}
        </Badge>
        <span className="text-muted-foreground">
          {billing.plan === "pro"
            ? `Upload up to ${capabilities.maxDocumentBatchUpload} files per batch.`
            : "Upload one file at a time. Upgrade to PRO for batch document processing."}
        </span>
        {billing.plan !== "pro" ? (
          <Link
            href="/settings/billing"
            className={cn(buttonVariants({ variant: "link", size: "sm" }), "h-auto px-1")}
          >
            Upgrade to PRO
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>Stored invoice and receipt documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((document) => (
              <div key={document.id} className="space-y-2 rounded border p-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{document.original_filename}</span>
                  <div className="flex items-center gap-2">
                    {renderStatus(document)}
                    {document.parse_status === "failed" || isStaleInFlight(document) ? (
                      <button
                        className="text-primary inline-flex items-center gap-1 text-xs underline"
                        onClick={() => void retryParse(document.id)}
                      >
                        <RefreshCw className="size-3" />
                        {isStaleInFlight(document) ? "Retry (stuck)" : "Retry"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {document.parse_status === "failed" && document.parse_error ? (
                  <p className="text-xs text-red-600">{document.parse_error}</p>
                ) : null}
              </div>
            ))}
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {pendingCandidates.map((candidate) => (
            <CandidateReview
              key={candidate.id}
              candidate={candidate}
              groups={groups}
              onConfirm={confirmCandidate}
              onReject={rejectCandidate}
            />
          ))}
          {pendingCandidates.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No pending candidates</CardTitle>
                <CardDescription>Upload a document to generate a review candidate.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {pendingCandidates.length > 3 ? (
            <p className="text-muted-foreground text-xs">
              Showing all {pendingCandidates.length} pending candidates.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
