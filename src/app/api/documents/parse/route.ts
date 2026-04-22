import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { extractDocumentText } from "@/lib/ingestion/extract-text";
import { parseDocumentCandidate } from "@/lib/ingestion/parser";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ParseBody = {
  workspaceId?: string;
  documentId?: string;
};

type CandidateDecisionBody = {
  workspaceId?: string;
  candidateId?: string;
  action?: "confirm" | "reject";
  groupId?: string;
  vendorName?: string;
  amount?: number;
  currency?: string;
  cadence?: "monthly" | "yearly" | "custom";
  renewalDate?: string;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

async function getAuthorizedUserId(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  try {
    const user = await getUserOrThrow(token);
    return user.id;
  } catch {
    return null;
  }
}

async function workspaceGuard(workspaceId: string, userId: string) {
  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  return !!workspace && workspace.owner_user_id === userId;
}

export async function POST(request: Request) {
  const userId = await getAuthorizedUserId(request);
  if (!userId) return unauthorized();

  let body: ParseBody;
  try {
    body = (await request.json()) as ParseBody;
  } catch {
    return badRequest("Invalid body.");
  }

  const workspaceId = body.workspaceId?.trim();
  const documentId = body.documentId?.trim();
  if (!workspaceId || !documentId) {
    return badRequest("workspaceId and documentId are required.");
  }
  if (!(await workspaceGuard(workspaceId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = supabaseService();
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, storage_path, original_filename, mime_type, parse_status")
    .eq("id", documentId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (documentError || !document) {
    return NextResponse.json(
      { error: documentError?.message ?? "Document not found." },
      { status: 404 }
    );
  }

  await supabase
    .from("documents")
    .update({ parse_status: "processing", parse_error: null })
    .eq("id", document.id)
    .eq("workspace_id", workspaceId);

  try {
    const download = await supabase.storage.from("documents").download(document.storage_path);
    if (download.error) {
      throw new Error(download.error.message);
    }

    const extracted = await extractDocumentText({
      filename: document.original_filename,
      mimeType: document.mime_type,
      blob: download.data,
    });

    const parsed = await parseDocumentCandidate({
      filename: document.original_filename,
      mimeType: document.mime_type,
      textContent: extracted.textContent,
    });

    const { data: candidate, error: candidateError } = await supabase
      .from("parsed_subscription_candidates")
      .insert({
        document_id: document.id,
        workspace_id: workspaceId,
        vendor_name: parsed.candidate.vendorName,
        amount: parsed.candidate.amount,
        currency: parsed.candidate.currency,
        cadence: parsed.candidate.cadence,
        renewal_date: parsed.candidate.renewalDate,
        confidence: parsed.candidate.confidence,
        raw_payload: {
          ...parsed.candidate.rawPayload,
          extractor: extracted.extractor,
          mimeType: document.mime_type,
        },
        status: "pending",
      })
      .select("*")
      .single();

    if (candidateError) {
      throw new Error(candidateError.message);
    }

    await supabase
      .from("documents")
      .update({ parse_status: "parsed", parse_error: null, parsed_at: new Date().toISOString() })
      .eq("id", document.id)
      .eq("workspace_id", workspaceId);

    return NextResponse.json({ ok: true, candidate, provider: parsed.provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document parsing failed.";
    await supabase
      .from("documents")
      .update({ parse_status: "failed", parse_error: message })
      .eq("id", document.id)
      .eq("workspace_id", workspaceId);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getAuthorizedUserId(request);
  if (!userId) return unauthorized();

  let body: CandidateDecisionBody;
  try {
    body = (await request.json()) as CandidateDecisionBody;
  } catch {
    return badRequest("Invalid body.");
  }

  const workspaceId = body.workspaceId?.trim();
  const candidateId = body.candidateId?.trim();
  if (!workspaceId || !candidateId || !body.action) {
    return badRequest("workspaceId, candidateId, and action are required.");
  }
  if (!(await workspaceGuard(workspaceId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = supabaseService();

  if (body.action === "reject") {
    const { error } = await supabase
      .from("parsed_subscription_candidates")
      .update({ status: "rejected" })
      .eq("id", candidateId)
      .eq("workspace_id", workspaceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (
    !body.groupId ||
    !body.vendorName ||
    body.amount == null ||
    !body.currency ||
    !body.renewalDate
  ) {
    return badRequest("Missing required fields for confirm.");
  }

  const { data: created, error: createError } = await supabase
    .from("subscriptions")
    .insert({
      group_id: body.groupId,
      vendor_name: body.vendorName,
      amount: body.amount,
      currency: body.currency.toUpperCase(),
      cadence: body.cadence ?? "monthly",
      renewal_date: body.renewalDate,
      status: "active",
    })
    .select("id")
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from("parsed_subscription_candidates")
    .update({ status: "confirmed", created_subscription_id: created.id, group_id: body.groupId })
    .eq("id", candidateId)
    .eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, subscriptionId: created.id });
}
