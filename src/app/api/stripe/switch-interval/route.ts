import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

async function resolveWorkspaceAndBilling(workspaceId: string, userId: string) {
  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== userId) return null;

  const { data: billing } = await supabase
    .from("workspace_billing")
    .select("stripe_customer_id, stripe_subscription_id, plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!billing?.stripe_subscription_id || billing.plan !== "pro") return null;
  return billing as { stripe_customer_id: string; stripe_subscription_id: string; plan: string };
}

/** GET — preview the upcoming prorated charge if switching monthly → annual */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!workspaceId || !token) {
    return NextResponse.json({ error: "workspaceId and auth required" }, { status: 400 });
  }
  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const billing = await resolveWorkspaceAndBilling(workspaceId, user.id);
  if (!billing)
    return NextResponse.json({ error: "No active Pro subscription found" }, { status: 400 });

  const env = getEnv();
  if (!env.STRIPE_PRICE_PRO_ANNUAL) {
    return NextResponse.json({ error: "Annual plan is not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  const prorationDate = Math.floor(Date.now() / 1000);

  try {
    const sub = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
    const item = sub.items.data[0];
    if (!item) return NextResponse.json({ error: "Subscription item not found" }, { status: 400 });

    const preview = await stripe.invoices.createPreview({
      customer: billing.stripe_customer_id,
      subscription: billing.stripe_subscription_id,
      subscription_details: {
        items: [{ id: item.id, price: env.STRIPE_PRICE_PRO_ANNUAL }],
        proration_behavior: "create_prorations",
        proration_date: prorationDate,
      },
    });

    return NextResponse.json({
      amountDue: preview.amount_due,
      currency: preview.currency,
      periodEnd: new Date(item.current_period_end * 1000).toISOString(),
      prorationDate,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to preview switch";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** POST — commit the switch from monthly → annual (proration applied immediately) */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    workspaceId?: string;
    prorationDate?: number;
  };
  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

  const billing = await resolveWorkspaceAndBilling(workspaceId, user.id);
  if (!billing)
    return NextResponse.json({ error: "No active Pro subscription found" }, { status: 400 });

  const env = getEnv();
  if (!env.STRIPE_PRICE_PRO_ANNUAL) {
    return NextResponse.json({ error: "Annual plan is not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  const prorationDate = body.prorationDate ?? Math.floor(Date.now() / 1000);

  try {
    const sub = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
    const item = sub.items.data[0];
    if (!item) return NextResponse.json({ error: "Subscription item not found" }, { status: 400 });

    await stripe.subscriptions.update(billing.stripe_subscription_id, {
      items: [{ id: item.id, price: env.STRIPE_PRICE_PRO_ANNUAL }],
      proration_behavior: "create_prorations",
      proration_date: prorationDate,
    });

    log.info("billing_interval_switched", {
      workspaceId,
      userId: user.id,
      targetInterval: "annual",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to switch interval";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
