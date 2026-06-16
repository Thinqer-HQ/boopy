import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const supabase = supabaseService();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: pending },
    { count: sent24h },
    { count: failedTotal },
    { data: recentFailures },
    { count: digestPending },
    { count: digestFailed },
  ] = await Promise.all([
    supabase
      .from("notification_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("notification_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("updated_at", since24h),
    supabase
      .from("notification_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("notification_jobs")
      .select("workspace_id, channel, error, attempt_count, updated_at, workspaces(name)")
      .eq("status", "failed")
      .order("updated_at", { ascending: false })
      .limit(25),
    supabase
      .from("notification_digest_runs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("notification_digest_runs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  const failures = (recentFailures ?? []).map((j) => ({
    workspaceId: j.workspace_id,
    workspaceName: (j.workspaces as { name?: string } | null)?.name ?? null,
    channel: j.channel,
    error: j.error ?? null,
    attemptCount: j.attempt_count,
    updatedAt: j.updated_at,
  }));

  return NextResponse.json({
    jobs: {
      pending: pending ?? 0,
      sent24h: sent24h ?? 0,
      failedTotal: failedTotal ?? 0,
    },
    digests: {
      pending: digestPending ?? 0,
      failed: digestFailed ?? 0,
    },
    recentFailures: failures,
  });
}
