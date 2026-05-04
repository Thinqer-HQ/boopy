import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { extractSubscriptionFromFile } from "@/lib/ingestion/extract-subscription-from-file";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  try {
    const result = await extractSubscriptionFromFile({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      blob: file,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
