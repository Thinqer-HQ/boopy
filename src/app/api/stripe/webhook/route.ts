import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const env = getEnv();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = getStripe();
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = supabaseService();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspace_id;
    if (workspaceId && session.customer && session.subscription) {
      await supabase.from("workspace_billing").upsert({
        workspace_id: workspaceId,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer.id,
        stripe_subscription_id:
          typeof session.subscription === "string" ? session.subscription : session.subscription.id,
        plan: "pro",
        status: "active",
      });
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const workspaceId = subscription.metadata?.workspace_id;
    if (workspaceId) {
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const plan = isActive ? "pro" : "free";
      await supabase.from("workspace_billing").upsert({
        workspace_id: workspaceId,
        stripe_customer_id:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price.id ?? null,
        plan,
        status: subscription.status,
      });
    }
  }

  log.info("billing_webhook_processed", { eventType: event.type, eventId: event.id });
  return NextResponse.json({ received: true });
}
