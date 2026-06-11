import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!workspaceId || !token) {
    return NextResponse.json(
      { error: "workspaceId and auth token are required." },
      { status: 400 }
    );
  }

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: integration } = await supabase
    .from("drive_integrations")
    .select("root_folder_name, last_synced_at, last_manual_sync_at, enabled, created_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { count: pendingDrafts } = await supabase
    .from("subscription_drafts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  return NextResponse.json({
    connected: Boolean(integration),
    rootFolderName: integration?.root_folder_name ?? "Boopy",
    lastSyncedAt: integration?.last_synced_at ?? null,
    lastManualSyncAt: integration?.last_manual_sync_at ?? null,
    enabled: integration?.enabled ?? false,
    connectedAt: integration?.created_at ?? null,
    pendingDrafts: pendingDrafts ?? 0,
  });
}
