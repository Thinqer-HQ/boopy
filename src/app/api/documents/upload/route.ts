import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return unauthorized();

  let userId: string;
  try {
    const user = await getUserOrThrow(token);
    userId = user.id;
  } catch {
    return unauthorized();
  }

  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "").trim();
  const file = form.get("file");

  if (!workspaceId) return badRequest("workspaceId is required.");
  if (!(file instanceof File)) return badRequest("file is required.");

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!workspace || workspace.owner_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.storage.createBucket("documents", { public: false }).catch(() => null);

  const extension = file.name.split(".").pop() || "bin";
  const path = `${workspaceId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const upload = await supabase.storage.from("documents").upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspaceId,
      uploader_user_id: userId,
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      parse_status: "pending",
    })
    .select("id, workspace_id, original_filename, parse_status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document });
}
