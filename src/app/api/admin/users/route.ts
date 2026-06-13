import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "50", 10))
  );
  const planFilter = url.searchParams.get("plan");

  const supabase = supabaseService();

  // Fetch all workspaces + billing in parallel
  const [{ data: workspaces }, { data: allBilling }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, owner_user_id, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_billing")
      .select("workspace_id, plan, status, stripe_customer_id, stripe_subscription_id"),
  ]);

  if (!workspaces)
    return NextResponse.json({ error: "Failed to load workspaces" }, { status: 500 });

  const billingMap = new Map((allBilling ?? []).map((b) => [b.workspace_id, b]));

  // Resolve user emails from auth.users via Supabase Admin API
  const ownerIds = [...new Set(workspaces.map((w) => w.owner_user_id).filter(Boolean))];
  const userEmailMap = new Map<string, string>();
  const userCreatedMap = new Map<string, string>();

  // Batch fetch user info in chunks of 50 (Supabase admin list limit)
  for (let i = 0; i < ownerIds.length; i += 50) {
    const chunk = ownerIds.slice(i, i + 50);
    const results = await Promise.all(chunk.map((uid) => supabase.auth.admin.getUserById(uid)));
    for (const { data } of results) {
      if (data?.user) {
        userEmailMap.set(data.user.id, data.user.email ?? "");
        userCreatedMap.set(data.user.id, data.user.created_at ?? "");
      }
    }
  }

  // Count subscriptions per workspace
  const workspaceIds = workspaces.map((w) => w.id);
  const { data: subCounts } = await supabase
    .from("subscriptions")
    .select("group_id:groups!inner(workspace_id)")
    .in("groups.workspace_id", workspaceIds.length > 0 ? workspaceIds : [""]);

  // Count groups per workspace
  const { data: groups } = await supabase
    .from("groups")
    .select("id, workspace_id")
    .in("workspace_id", workspaceIds.length > 0 ? workspaceIds : [""]);

  // Count active subscriptions per workspace
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("id, status, groups!inner(workspace_id)")
    .eq("status", "active")
    .in("groups.workspace_id", workspaceIds.length > 0 ? workspaceIds : [""]);

  // Build sub count maps — using a simplified query with direct group join
  const { data: allSubs } = await supabase
    .from("groups")
    .select("id, workspace_id, subscriptions(id, status)")
    .in("workspace_id", workspaceIds.length > 0 ? workspaceIds : [""]);

  const subCountMap = new Map<string, { total: number; active: number }>();
  for (const g of allSubs ?? []) {
    const existing = subCountMap.get(g.workspace_id) ?? { total: 0, active: 0 };
    const subs = Array.isArray(g.subscriptions) ? g.subscriptions : [];
    existing.total += subs.length;
    existing.active += subs.filter((s: { status: string }) => s.status === "active").length;
    subCountMap.set(g.workspace_id, existing);
  }

  const groupCountMap = new Map<string, number>();
  for (const g of groups ?? []) {
    groupCountMap.set(g.workspace_id, (groupCountMap.get(g.workspace_id) ?? 0) + 1);
  }

  // Build response objects
  let rows = workspaces.map((w) => {
    const billing = billingMap.get(w.id);
    return {
      userId: w.owner_user_id,
      email: userEmailMap.get(w.owner_user_id) ?? null,
      workspaceId: w.id,
      workspaceName: w.name,
      plan: billing?.plan ?? "free",
      billingStatus: billing?.status ?? null,
      stripeCustomerId: billing?.stripe_customer_id ?? null,
      stripeSubscriptionId: billing?.stripe_subscription_id ?? null,
      subscriptionCount: subCountMap.get(w.id)?.total ?? 0,
      activeSubscriptionCount: subCountMap.get(w.id)?.active ?? 0,
      groupCount: groupCountMap.get(w.id) ?? 0,
      joinedAt: userCreatedMap.get(w.owner_user_id) ?? w.created_at ?? null,
    };
  });

  if (planFilter === "pro" || planFilter === "free") {
    rows = rows.filter((r) => r.plan === planFilter);
  }

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const data = rows.slice(offset, offset + pageSize);

  return NextResponse.json({
    data,
    pagination: { page, pageSize, total, totalPages },
  });
}
