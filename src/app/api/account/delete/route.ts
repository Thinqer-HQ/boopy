import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { log } from "@/lib/log";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

/**
 * DELETE /api/account/delete
 * Permanently erases all user data and closes the account.
 * Satisfies GDPR Article 17 (Right to Erasure / Right to be Forgotten).
 *
 * Order of operations:
 * 1. Cancel active Stripe subscription (avoids future charges)
 * 2. Delete workspace rows — ON DELETE CASCADE wipes groups, subscriptions,
 *    billing, integrations, push subscriptions, notification jobs, drafts, etc.
 * 3. Delete the Supabase auth user (removes email + session data)
 */
export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseService();

  // 1. Find all workspaces owned by this user
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id);

  const workspaceIds = (workspaces ?? []).map((w) => w.id);

  // 2. Cancel any active Stripe subscriptions to avoid future charges
  if (workspaceIds.length > 0) {
    const { data: billingRows } = await supabase
      .from("workspace_billing")
      .select("stripe_subscription_id")
      .in("workspace_id", workspaceIds)
      .not("stripe_subscription_id", "is", null);

    const stripe = getStripe();
    for (const row of billingRows ?? []) {
      if (!row.stripe_subscription_id) continue;
      try {
        await stripe.subscriptions.cancel(row.stripe_subscription_id, {
          cancellation_details: { comment: "Account deleted by user (GDPR erasure)" },
        });
      } catch (err) {
        // Log but do not block — deletion proceeds regardless
        log.warn("gdpr_stripe_cancel_failed", {
          userId: user.id,
          subscriptionId: row.stripe_subscription_id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // 3. Delete workspaces — CASCADE removes everything attached
  if (workspaceIds.length > 0) {
    await supabase.from("workspaces").delete().in("id", workspaceIds);
  }

  // 4. Delete the auth user (removes email, session tokens, login history)
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (authDeleteError) {
    log.error("gdpr_auth_delete_failed", { userId: user.id, error: authDeleteError.message });
    // Return error — workspace data is already deleted; auth cleanup is best-effort
    // but we should surface the failure so the user can contact support
    return NextResponse.json(
      {
        error:
          "Workspace data was deleted but auth account removal failed. Please contact support to complete erasure.",
        partial: true,
      },
      { status: 500 }
    );
  }

  log.info("gdpr_account_deleted", { userId: user.id, workspacesDeleted: workspaceIds.length });
  return NextResponse.json({
    ok: true,
    message: "Account and all associated data have been permanently deleted.",
  });
}
