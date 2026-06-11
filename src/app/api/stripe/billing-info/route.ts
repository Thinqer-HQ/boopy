import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

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

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: billing } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id, stripe_price_id, plan, status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!billing?.stripe_subscription_id || billing.plan !== "pro") {
    return NextResponse.json({
      interval: null,
      currentPeriodEnd: null,
      trialEnd: null,
      annualAvailable: false,
    });
  }

  const env = getEnv();
  const annualPriceId = env.STRIPE_PRICE_PRO_ANNUAL;
  const monthlyPriceId = env.STRIPE_PRICE_PRO_MONTHLY;

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);

    const activePriceId = sub.items.data[0]?.price.id ?? billing.stripe_price_id;
    let interval: "monthly" | "annual" | "unknown" = "unknown";
    if (activePriceId === monthlyPriceId) interval = "monthly";
    else if (annualPriceId && activePriceId === annualPriceId) interval = "annual";
    else interval = sub.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly";

    const item = sub.items.data[0];
    const periodEnd = item?.current_period_end ?? null;
    return NextResponse.json({
      interval,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      status: sub.status,
      annualAvailable: Boolean(annualPriceId) && interval === "monthly",
    });
  } catch {
    return NextResponse.json({
      interval: null,
      currentPeriodEnd: null,
      trialEnd: null,
      annualAvailable: false,
    });
  }
}
