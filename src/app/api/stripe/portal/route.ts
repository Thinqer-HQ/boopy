import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

type PortalRequestBody = {
  workspaceId?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PortalRequestBody;
  try {
    body = (await request.json()) as PortalRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  let userId: string;
  try {
    const user = await getUserOrThrow(token);
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseService();
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, owner_user_id")
    .eq("id", workspaceId)
    .single();
  if (workspaceError || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  if (workspace.owner_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: billing, error: billingError } = await supabase
    .from("workspace_billing")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (billingError) {
    return NextResponse.json({ error: billingError.message }, { status: 500 });
  }
  if (!billing?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found for this workspace yet." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const env = getEnv();
  const session = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ portalUrl: session.url });
}
