import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { log } from "@/lib/log";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const user = await getUserOrThrow(token);
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseService();

  const { data: existing, error: findErr } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", userId)
    .limit(1);

  if (findErr) {
    log.error("bootstrap_find_workspace_failed", {
      userId,
      error: findErr.message,
    });
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }

  if (!existing || existing.length === 0) {
    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .insert({ owner_user_id: userId, name: "Personal" })
      .select("id")
      .single();

    if (wsErr || !ws) {
      log.error("bootstrap_create_workspace_failed", {
        userId,
        error: wsErr?.message,
      });
      return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
    }

    // Group-first default container (kept generic for personal and agency use).
    await supabase.from("groups").insert({ workspace_id: ws.id, name: "General" });
    // Backward-compatible legacy client seed while old routes are still reachable.
    await supabase.from("clients").insert({ workspace_id: ws.id, name: "General" });
    await supabase.from("notification_prefs").insert({ workspace_id: ws.id });

    log.info("bootstrap_created_personal_workspace", {
      userId,
      workspaceId: ws.id,
    });
  }

  return NextResponse.json({ ok: true });
}
