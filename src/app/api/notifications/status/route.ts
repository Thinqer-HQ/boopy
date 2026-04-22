import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!workspaceId || !token) return unauthorized();

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return unauthorized();

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [prefsResult, jobsResult, destinationsResult, pushResult] = await Promise.all([
    supabase
      .from("notification_prefs")
      .select("email_enabled, push_enabled, lead_times_days")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    supabase
      .from("notification_jobs")
      .select("status", { count: "exact", head: false })
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("notification_destinations")
      .select("id, is_enabled", { count: "exact", head: false })
      .eq("workspace_id", workspaceId),
    supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: false })
      .eq("workspace_id", workspaceId),
  ]);

  const statuses = (jobsResult.data ?? []).reduce(
    (acc, row) => {
      const key = row.status as "pending" | "sent" | "failed";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    { pending: 0, sent: 0, failed: 0 } as Record<"pending" | "sent" | "failed", number>
  );

  return NextResponse.json({
    ok: true,
    prefs: prefsResult.data ?? null,
    jobs: {
      pending: statuses.pending,
      sent: statuses.sent,
      failed: statuses.failed,
      total: jobsResult.count ?? 0,
    },
    destinations: {
      total: destinationsResult.count ?? 0,
      enabled: (destinationsResult.data ?? []).filter((row) => row.is_enabled).length,
    },
    pushSubscriptions: pushResult.count ?? 0,
  });
}
