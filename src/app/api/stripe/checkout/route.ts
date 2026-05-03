import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

type CheckoutRequestBody = {
  workspaceId?: string;
  /** Optional customer-facing code from Stripe (Promotion codes in Dashboard). */
  promotionCode?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  let userId: string;
  let userEmail: string;
  try {
    const user = await getUserOrThrow(token);
    userId = user.id;
    userEmail = user.email ?? "";
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseService();
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name, owner_user_id")
    .eq("id", workspaceId)
    .single();

  if (workspaceError || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  if (workspace.owner_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = getEnv();
  if (!env.STRIPE_PRICE_PRO_MONTHLY) {
    return NextResponse.json({ error: "Stripe price is not configured" }, { status: 500 });
  }

  const { data: existingBilling } = await supabase
    .from("workspace_billing")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const stripe = getStripe();

  const promotionCodeInput = body.promotionCode?.trim();
  let discounts: [{ promotion_code: string }] | undefined;
  if (promotionCodeInput) {
    const promoList = await stripe.promotionCodes.list({
      code: promotionCodeInput,
      active: true,
      limit: 1,
    });
    const promo = promoList.data[0];
    if (!promo?.active) {
      return NextResponse.json({ error: "Invalid or inactive promotion code." }, { status: 400 });
    }
    discounts = [{ promotion_code: promo.id }];
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: env.STRIPE_PRICE_PRO_MONTHLY,
        quantity: 1,
      },
    ],
    customer: existingBilling?.stripe_customer_id ?? undefined,
    customer_email: existingBilling?.stripe_customer_id ? undefined : userEmail || undefined,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=cancelled`,
    ...(discounts
      ? { discounts }
      : {
          allow_promotion_codes: true,
        }),
    metadata: {
      workspace_id: workspaceId,
      owner_user_id: userId,
    },
    subscription_data: {
      metadata: {
        workspace_id: workspaceId,
        owner_user_id: userId,
      },
    },
  });

  log.info("billing_checkout_created", {
    workspaceId,
    userId,
    stripeSessionId: session.id,
    promotionSource: promotionCodeInput ? "body" : "stripe_checkout",
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
