import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const redirectToRaw = url.searchParams.get("redirectTo")?.trim();
  const redirectTo =
    redirectToRaw && redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : "/settings/notifications";
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

  const state = `${workspaceId}|${user.id}|${Date.now()}|${encodeURIComponent(redirectTo)}`;
  return NextResponse.json({ url: getGoogleAuthUrl(state) });
}
