import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { syncWorkspaceCalendar, type CalendarSyncScope } from "@/lib/calendar/sync";
import { supabaseService } from "@/lib/supabase/server";

type Body = {
  workspaceId?: string;
  scope?: CalendarSyncScope;
  month?: string | null;
  dates?: string[] | null;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  const scope = body.scope ?? "all";
  if (!["all", "month", "days"].includes(scope)) {
    return NextResponse.json({ error: "Invalid sync scope" }, { status: 400 });
  }
  if (scope === "days" && (!body.dates || body.dates.length === 0)) {
    return NextResponse.json(
      { error: "At least one date is required for day sync" },
      { status: 400 }
    );
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

  await syncWorkspaceCalendar(workspaceId, {
    scope,
    month: body.month ?? null,
    dates: body.dates ?? null,
  });
  return NextResponse.json({ ok: true });
}
