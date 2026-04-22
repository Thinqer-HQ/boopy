import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { dispatchNotification } from "@/lib/notifications/router";
import { supabaseService } from "@/lib/supabase/server";

type Body = {
  workspaceId?: string;
  destinationId?: string;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const body = (await request.json().catch(() => ({}))) as Body;
  const workspaceId = body.workspaceId?.trim();
  const destinationId = body.destinationId?.trim();
  if (!workspaceId || !destinationId) {
    return NextResponse.json(
      { error: "workspaceId and destinationId are required" },
      { status: 400 }
    );
  }

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id, name")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: destination } = await supabase
    .from("notification_destinations")
    .select("channel, target_url, secret_header")
    .eq("id", destinationId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!destination) {
    return NextResponse.json({ error: "Destination not found" }, { status: 404 });
  }

  try {
    await dispatchNotification(
      {
        workspaceName: workspace.name,
        groupName: "General",
        vendorName: "Boopy test reminder",
        amount: 1,
        currency: "USD",
        renewalDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        leadTimeDays: 1,
      },
      {
        channel: destination.channel,
        webhookUrl: destination.target_url ?? undefined,
        secretHeader: destination.secret_header ?? null,
      }
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send test failed" },
      { status: 500 }
    );
  }
}
