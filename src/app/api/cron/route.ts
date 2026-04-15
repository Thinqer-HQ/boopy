import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { sendRenewalEmail } from "@/lib/notifications/email";
import { sendPushReminder } from "@/lib/notifications/push";
import { collectDueNotificationPlans } from "@/lib/notifications/scheduler";
import { supabaseService } from "@/lib/supabase/server";

type NotificationPrefsRow = {
  workspace_id: string;
  lead_times_days: number[];
  email_enabled: boolean;
  push_enabled: boolean;
};

type SubscriptionRow = {
  id: string;
  renewal_date: string;
  status: "active" | "paused" | "cancelled";
  clients:
    | {
        workspace_id: string;
      }
    | Array<{ workspace_id: string }>
    | null;
};

type PendingEmailJobRow = {
  id: string;
  lead_time_days: number;
  renewal_date: string;
  attempt_count: number;
  subscriptions:
    | {
        vendor_name: string;
        amount: number;
        currency: string;
        clients:
          | {
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }>
          | null;
      }
    | Array<{
        vendor_name: string;
        amount: number;
        currency: string;
        clients:
          | {
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }>
          | null;
      }>
    | null;
};

type PendingPushJobRow = {
  id: string;
  workspace_id: string;
  lead_time_days: number;
  renewal_date: string;
  attempt_count: number;
  subscriptions:
    | {
        vendor_name: string;
        amount: number;
        currency: string;
        clients:
          | {
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }>
          | null;
      }
    | Array<{
        vendor_name: string;
        amount: number;
        currency: string;
        clients:
          | {
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }>
          | null;
      }>
    | null;
};

type PushSubscriptionRow = {
  workspace_id: string;
  subscription_json: PushSubscriptionJSON;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function authErrorResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isMissingTableError(message: string | undefined) {
  if (!message) return false;
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

export async function GET(request: Request) {
  const env = getEnv();
  const suppliedSecret = request.headers.get("x-cron-secret");
  const authorization = request.headers.get("authorization");
  const bearerSecret = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (env.CRON_SECRET && suppliedSecret !== env.CRON_SECRET && bearerSecret !== env.CRON_SECRET) {
    return authErrorResponse();
  }

  const supabase = supabaseService();
  const now = new Date();
  const nowIso = now.toISOString();
  const runId = crypto.randomUUID();

  log.info("cron_run_started", { runId, nowIso });

  const { data: prefsRows, error: prefsError } = await supabase
    .from("notification_prefs")
    .select("workspace_id, lead_times_days, email_enabled, push_enabled");
  if (prefsError) {
    if (isMissingTableError(prefsError.message)) {
      log.warn("cron_skipped_schema_not_ready", { runId, error: prefsError.message });
      return NextResponse.json({
        ok: true,
        runId,
        skipped: true,
        reason: "Database schema not ready for notification tables",
      });
    }
    log.error("cron_load_prefs_failed", { runId, error: prefsError.message });
    return NextResponse.json({ error: "Failed to load notification prefs" }, { status: 500 });
  }

  const prefsByWorkspaceId = Object.fromEntries(
    ((prefsRows ?? []) as NotificationPrefsRow[]).map((row) => [
      row.workspace_id,
      {
        leadTimesDays: row.lead_times_days,
        emailEnabled: row.email_enabled,
        pushEnabled: row.push_enabled,
      },
    ])
  );

  const { data: subscriptionRows, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id, renewal_date, status, clients!inner(workspace_id)")
    .eq("status", "active")
    .lte(
      "renewal_date",
      new Date(now.getTime() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10)
    );

  if (subscriptionsError) {
    log.error("cron_load_subscriptions_failed", { runId, error: subscriptionsError.message });
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }

  const plans = collectDueNotificationPlans({
    now,
    subscriptions: ((subscriptionRows ?? []) as SubscriptionRow[])
      .map((row) => {
        const client = first(row.clients);
        if (!client?.workspace_id) return null;
        return {
          id: row.id,
          workspaceId: client.workspace_id,
          renewalDate: row.renewal_date,
          status: row.status,
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null),
    prefsByWorkspaceId,
  });

  if (plans.length > 0) {
    const { error: insertError } = await supabase.from("notification_jobs").upsert(
      plans.map((plan) => ({
        workspace_id: plan.workspaceId,
        subscription_id: plan.subscriptionId,
        channel: plan.channel,
        lead_time_days: plan.leadTimeDays,
        renewal_date: plan.renewalDate,
        scheduled_for: plan.scheduledFor,
        idempotency_key: plan.idempotencyKey,
      })),
      { onConflict: "workspace_id,idempotency_key", ignoreDuplicates: true }
    );

    if (insertError) {
      log.error("cron_insert_jobs_failed", {
        runId,
        error: insertError.message,
        planCount: plans.length,
      });
      return NextResponse.json({ error: "Failed to create jobs" }, { status: 500 });
    }
  }

  const { data: pendingEmailJobs, error: pendingJobsError } = await supabase
    .from("notification_jobs")
    .select(
      "id, lead_time_days, renewal_date, attempt_count, subscriptions!inner(vendor_name, amount, currency, clients!inner(name, workspaces!inner(owner_user_id, name)))"
    )
    .eq("channel", "email")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(100);

  if (pendingJobsError) {
    log.error("cron_load_pending_jobs_failed", { runId, error: pendingJobsError.message });
    return NextResponse.json({ error: "Failed to load pending jobs" }, { status: 500 });
  }

  let emailsSent = 0;
  let emailsFailed = 0;

  for (const job of (pendingEmailJobs ?? []) as PendingEmailJobRow[]) {
    try {
      const subscription = first(job.subscriptions);
      const client = first(subscription?.clients);
      const workspace = first(client?.workspaces);
      if (!subscription || !client || !workspace) {
        throw new Error("Missing relational data for notification job");
      }

      const { data: userResponse, error: userError } = await supabase.auth.admin.getUserById(
        workspace.owner_user_id
      );
      if (userError) throw new Error(userError.message);
      const email = userResponse?.user?.email;
      if (!email) throw new Error("Workspace owner has no email");

      await sendRenewalEmail({
        to: email,
        workspaceName: workspace.name,
        clientName: client.name,
        vendorName: subscription.vendor_name,
        amount: Number(subscription.amount ?? 0),
        currency: subscription.currency,
        renewalDate: job.renewal_date,
        leadTimeDays: job.lead_time_days,
      });

      const { error: updateError } = await supabase
        .from("notification_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempt_count: (job.attempt_count ?? 0) + 1,
          error: null,
        })
        .eq("id", job.id);
      if (updateError) throw new Error(updateError.message);
      emailsSent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email send failure";
      const { error: failUpdateError } = await supabase
        .from("notification_jobs")
        .update({
          status: "failed",
          attempt_count: (job.attempt_count ?? 0) + 1,
          error: message,
        })
        .eq("id", job.id);

      if (failUpdateError) {
        log.error("cron_mark_job_failed_update_failed", {
          runId,
          jobId: job.id,
          updateError: failUpdateError.message,
          originalError: message,
        });
      }
      emailsFailed += 1;
    }
  }

  const { data: pendingPushJobs, error: pendingPushJobsError } = await supabase
    .from("notification_jobs")
    .select(
      "id, workspace_id, lead_time_days, renewal_date, attempt_count, subscriptions!inner(vendor_name, amount, currency, clients!inner(name, workspaces!inner(owner_user_id, name)))"
    )
    .eq("channel", "push")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(100);

  if (pendingPushJobsError) {
    log.error("cron_load_pending_push_jobs_failed", {
      runId,
      error: pendingPushJobsError.message,
    });
    return NextResponse.json({ error: "Failed to load pending push jobs" }, { status: 500 });
  }

  const workspaceIds = [
    ...new Set(((pendingPushJobs ?? []) as PendingPushJobRow[]).map((job) => job.workspace_id)),
  ];
  const pushByWorkspaceId = new Map<string, PushSubscriptionJSON[]>();
  if (workspaceIds.length > 0) {
    const { data: pushRows, error: pushRowsError } = await supabase
      .from("push_subscriptions")
      .select("workspace_id, subscription_json")
      .in("workspace_id", workspaceIds);

    if (pushRowsError) {
      log.error("cron_load_push_subscriptions_failed", { runId, error: pushRowsError.message });
      return NextResponse.json({ error: "Failed to load push subscriptions" }, { status: 500 });
    }

    for (const row of (pushRows ?? []) as PushSubscriptionRow[]) {
      const current = pushByWorkspaceId.get(row.workspace_id) ?? [];
      current.push(row.subscription_json);
      pushByWorkspaceId.set(row.workspace_id, current);
    }
  }

  let pushesSent = 0;
  let pushesFailed = 0;

  for (const job of (pendingPushJobs ?? []) as PendingPushJobRow[]) {
    try {
      const subscription = first(job.subscriptions);
      const client = first(subscription?.clients);
      const workspace = first(client?.workspaces);
      if (!subscription || !client || !workspace) {
        throw new Error("Missing relational data for push job");
      }

      const subscriptionsForWorkspace = pushByWorkspaceId.get(job.workspace_id) ?? [];
      if (subscriptionsForWorkspace.length === 0) {
        throw new Error("No push subscriptions saved for workspace");
      }

      for (const pushSub of subscriptionsForWorkspace) {
        await sendPushReminder({
          subscription: pushSub,
          workspaceName: workspace.name,
          clientName: client.name,
          vendorName: subscription.vendor_name,
          amount: Number(subscription.amount ?? 0),
          currency: subscription.currency,
          renewalDate: job.renewal_date,
          leadTimeDays: job.lead_time_days,
        });
      }

      const { error: updateError } = await supabase
        .from("notification_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempt_count: (job.attempt_count ?? 0) + 1,
          error: null,
        })
        .eq("id", job.id);
      if (updateError) throw new Error(updateError.message);

      pushesSent += 1;
    } catch (pushError) {
      const message = pushError instanceof Error ? pushError.message : "Unknown push send failure";
      const { error: failUpdateError } = await supabase
        .from("notification_jobs")
        .update({
          status: "failed",
          attempt_count: (job.attempt_count ?? 0) + 1,
          error: message,
        })
        .eq("id", job.id);
      if (failUpdateError) {
        log.error("cron_mark_push_job_failed_update_failed", {
          runId,
          jobId: job.id,
          updateError: failUpdateError.message,
          originalError: message,
        });
      }
      pushesFailed += 1;
    }
  }

  log.info("cron_run_finished", {
    runId,
    plansEvaluated: plans.length,
    emailsSent,
    emailsFailed,
    pushesSent,
    pushesFailed,
  });

  return NextResponse.json({
    ok: true,
    runId,
    plansEvaluated: plans.length,
    emailsSent,
    emailsFailed,
    pushesSent,
    pushesFailed,
  });
}
