import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { removeGoogleCalendarEventForSubscription } from "@/lib/calendar/sync";
import { supabaseService } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: subscriptionId } = await context.params;
  if (!subscriptionId?.trim()) {
    return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
  }

  const supabase = supabaseService();
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("id, group_id")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }
  if (!subscription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("workspace_id")
    .eq("id", subscription.group_id)
    .maybeSingle();

  if (groupError || !group?.workspace_id) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("owner_user_id")
    .eq("id", group.workspace_id)
    .maybeSingle();

  if (workspaceError || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  if (workspace.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await removeGoogleCalendarEventForSubscription(group.workspace_id, subscriptionId);
  } catch {
    return NextResponse.json({ error: "Could not remove Google Calendar event" }, { status: 502 });
  }

  const { error: deleteError } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", subscriptionId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
