import { NextResponse } from "next/server";

import { checkAdminAuth } from "@/lib/admin/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  const { userId } = await params;
  const supabase = supabaseService();

  // Resolve user from Supabase Auth
  const { data: authData, error: authError2 } = await supabase.auth.admin.getUserById(userId);
  if (authError2 || !authData?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const authUser = authData.user;

  // Get workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!workspace) {
    return NextResponse.json({
      userId,
      email: authUser.email ?? null,
      workspaceId: null,
      workspaceName: null,
      plan: "free",
      billingStatus: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionCount: 0,
      activeSubscriptionCount: 0,
      groupCount: 0,
      joinedAt: authUser.created_at ?? null,
      subscriptions: [],
    });
  }

  const [{ data: billing }, { data: groups }] = await Promise.all([
    supabase
      .from("workspace_billing")
      .select("plan, status, stripe_customer_id, stripe_subscription_id")
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
    supabase
      .from("groups")
      .select(
        "id, name, subscriptions(id, vendor_name, amount, currency, cadence, status, renewal_date, created_at)"
      )
      .eq("workspace_id", workspace.id),
  ]);

  const allSubs = (groups ?? []).flatMap((g) => {
    const subs = Array.isArray(g.subscriptions) ? g.subscriptions : [];
    return subs.map((s: Record<string, unknown>) => ({
      id: s.id as string,
      vendorName: s.vendor_name as string,
      amount: Number(s.amount) || 0,
      currency: s.currency as string,
      cadence: s.cadence as string,
      status: s.status as string,
      groupName: g.name,
      renewalDate: s.renewal_date as string | null,
      createdAt: s.created_at as string | null,
    }));
  });

  return NextResponse.json({
    userId,
    email: authUser.email ?? null,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    plan: billing?.plan ?? "free",
    billingStatus: billing?.status ?? null,
    stripeCustomerId: billing?.stripe_customer_id ?? null,
    stripeSubscriptionId: billing?.stripe_subscription_id ?? null,
    subscriptionCount: allSubs.length,
    activeSubscriptionCount: allSubs.filter((s) => s.status === "active").length,
    groupCount: (groups ?? []).length,
    joinedAt: authUser.created_at ?? null,
    subscriptions: allSubs,
  });
}
