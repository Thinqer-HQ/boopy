import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

type SubscribeBody = {
  workspaceId?: string;
  subscription?: PushSubscriptionJSON;
};

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

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return badRequest("Invalid request body.");
  }

  const workspaceId = body.workspaceId?.trim();
  const subscription = body.subscription;
  if (!workspaceId) return badRequest("workspaceId is required.");
  if (!subscription?.endpoint || !subscription.keys?.auth || !subscription.keys.p256dh) {
    return badRequest("Invalid push subscription payload.");
  }

  const supabase = supabaseService();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      workspace_id: workspaceId,
      user_id: userId,
      subscription_json: subscription,
    },
    { onConflict: "workspace_id,user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
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

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return badRequest("Invalid request body.");
  }

  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) return badRequest("workspaceId is required.");

  const supabase = supabaseService();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
