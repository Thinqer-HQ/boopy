import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const supabase = supabaseService();

  const [{ data: churnedBilling }, { data: workspaceSubs }] = await Promise.all([
    // Churned Pro users
    supabase
      .from("workspace_billing")
      .select("workspace_id, status, updated_at, workspaces(id, name, owner_user_id)")
      .eq("plan", "pro")
      .eq("status", "canceled")
      .order("updated_at", { ascending: false })
      .limit(50),
    // Free workspaces near the 3-subscription limit (have 2+ active subs)
    supabase
      .from("groups")
      .select("workspace_id, subscriptions(id, status)")
      .not("workspace_id", "is", null),
  ]);

  // Build free-near-limit list
  const subsByWorkspace = new Map<string, number>();
  for (const g of workspaceSubs ?? []) {
    const subs = Array.isArray(g.subscriptions) ? g.subscriptions : [];
    const active = subs.filter((s: { status: string }) => s.status === "active").length;
    subsByWorkspace.set(g.workspace_id, (subsByWorkspace.get(g.workspace_id) ?? 0) + active);
  }

  // Identify workspaces with 2+ active subs (approaching free limit of 3)
  const nearLimitIds = [...subsByWorkspace.entries()]
    .filter(([, count]) => count >= 2)
    .map(([id]) => id);

  // Get billing for those workspaces to exclude Pro users
  const nearLimitAlerts: Array<{
    type: string;
    workspaceId: string;
    workspaceName: string | null;
    email: string | null;
    detail: string;
  }> = [];

  if (nearLimitIds.length > 0) {
    const { data: nearBilling } = await supabase
      .from("workspace_billing")
      .select("workspace_id, plan")
      .in("workspace_id", nearLimitIds);

    const billingByWs = new Map((nearBilling ?? []).map((b) => [b.workspace_id, b.plan]));
    const freeNearLimit = nearLimitIds.filter((id) => (billingByWs.get(id) ?? "free") === "free");

    if (freeNearLimit.length > 0) {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id, name, owner_user_id")
        .in("id", freeNearLimit);

      // Resolve emails
      const ownerIds = (ws ?? []).map((w) => w.owner_user_id).filter(Boolean);
      const emailMap = new Map<string, string>();
      for (let i = 0; i < ownerIds.length; i += 50) {
        const chunk = ownerIds.slice(i, i + 50);
        const results = await Promise.all(chunk.map((uid) => supabase.auth.admin.getUserById(uid)));
        for (const { data } of results) {
          if (data?.user) emailMap.set(data.user.id, data.user.email ?? "");
        }
      }

      for (const w of ws ?? []) {
        nearLimitAlerts.push({
          type: "near_free_limit",
          workspaceId: w.id,
          workspaceName: w.name,
          email: emailMap.get(w.owner_user_id) ?? null,
          detail: `${subsByWorkspace.get(w.id) ?? 0}/3 active subscriptions (Free plan)`,
        });
      }
    }
  }

  // Resolve emails for churned billing
  const churnedOwnerIds = (churnedBilling ?? [])
    .map((b) => (b.workspaces as { owner_user_id?: string } | null)?.owner_user_id)
    .filter(Boolean) as string[];

  const churnedEmailMap = new Map<string, string>();
  for (let i = 0; i < churnedOwnerIds.length; i += 50) {
    const chunk = churnedOwnerIds.slice(i, i + 50);
    const results = await Promise.all(chunk.map((uid) => supabase.auth.admin.getUserById(uid)));
    for (const { data } of results) {
      if (data?.user) churnedEmailMap.set(data.user.id, data.user.email ?? "");
    }
  }

  const churnedAlerts = (churnedBilling ?? []).map((b) => {
    const ws = b.workspaces as { id?: string; name?: string; owner_user_id?: string } | null;
    return {
      type: "churned_pro",
      workspaceId: ws?.id ?? b.workspace_id,
      workspaceName: ws?.name ?? null,
      email: ws?.owner_user_id ? (churnedEmailMap.get(ws.owner_user_id) ?? null) : null,
      detail: `Pro subscription canceled`,
    };
  });

  return NextResponse.json({
    alerts: [...churnedAlerts, ...nearLimitAlerts],
    counts: {
      churnedPro: churnedAlerts.length,
      nearFreeLimit: nearLimitAlerts.length,
    },
  });
}
