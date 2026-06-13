import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const supabase = supabaseService();

  const [
    { count: totalWorkspaces },
    { data: billingRows },
    { count: totalSubs },
    { count: activeSubs },
  ] = await Promise.all([
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("workspace_billing").select("plan, status"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const proUsers = (billingRows ?? []).filter((b) => b.plan === "pro").length;
  const trialUsers = (billingRows ?? []).filter((b) => b.status === "trialing").length;

  // Total users = distinct workspace owners (approximated by workspace count since 1:1)
  const totalUsers = totalWorkspaces ?? 0;
  const freeUsers = totalUsers - proUsers;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    users: {
      total: totalUsers,
      pro: proUsers,
      free: Math.max(0, freeUsers),
      activeTrial: trialUsers,
    },
    workspaces: {
      total: totalWorkspaces ?? 0,
    },
    subscriptions: {
      total: totalSubs ?? 0,
      active: activeSubs ?? 0,
    },
  });
}
