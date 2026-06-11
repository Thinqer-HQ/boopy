import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { scanDriveForWorkspace } from "@/lib/drive/scan";
import { supabaseService } from "@/lib/supabase/server";

const RATE_LIMIT_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { workspaceId?: string };
  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

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
    .select("last_manual_sync_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ error: "Google Drive is not connected." }, { status: 400 });
  }

  if (integration.last_manual_sync_at) {
    const since = Date.now() - new Date(integration.last_manual_sync_at).getTime();
    if (since < RATE_LIMIT_MS) {
      const retryAfter = Math.ceil((RATE_LIMIT_MS - since) / 1000);
      return NextResponse.json(
        { error: `Rate limited. Try again in ${retryAfter}s.`, retryAfter },
        { status: 429 }
      );
    }
  }

  await supabase
    .from("drive_integrations")
    .update({ last_manual_sync_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId);

  const result = await scanDriveForWorkspace(workspaceId);
  return NextResponse.json({ ok: true, ...result });
}
