import { NextResponse } from "next/server";

import { syncWorkspaceCalendar } from "@/lib/calendar/sync";
import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { dispatchNotification, type NotificationChannel } from "@/lib/notifications/router";
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
  groups: { workspace_id: string } | Array<{ workspace_id: string }> | null;
};

type DestinationRow = {
  id: string;
  workspace_id: string;
  channel: NotificationChannel;
  target_url: string | null;
  secret_header: string | null;
  is_enabled: boolean;
};

type PendingJobRow = {
  id: string;
  workspace_id: string;
  subscription_id: string;
  channel: NotificationChannel;
  destination_id: string | null;
  lead_time_days: number;
  renewal_date: string;
  attempt_count: number;
  subscriptions:
    | {
        vendor_name: string;
        amount: number;
        currency: string;
        groups:
          | {
              name: string;
              workspace_id: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspace_id: string;
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
        groups:
          | {
              name: string;
              workspace_id: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }
          | Array<{
              name: string;
              workspace_id: string;
              workspaces:
                | { owner_user_id: string; name: string }
                | Array<{ owner_user_id: string; name: string }>
                | null;
            }>
          | null;
      }>
    | null;
  notification_destinations:
    | { target_url: string | null; secret_header: string | null }
    | Array<{ target_url: string | null; secret_header: string | null }>
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

  const { data: prefsRows, error: prefsError } = await supabase
    .from("notification_prefs")
    .select("workspace_id, lead_times_days, email_enabled, push_enabled");
  if (prefsError) {
    if (isMissingTableError(prefsError.message)) {
      return NextResponse.json({
        ok: true,
        runId,
        skipped: true,
        reason: "Database schema not ready for notification tables",
      });
    }
    return NextResponse.json({ error: "Failed to load notification prefs" }, { status: 500 });
  }

  const prefsByWorkspaceId = Object.fromEntries(
    ((prefsRows ?? []) as NotificationPrefsRow[]).map((row) => [
      row.workspace_id,
      {
        leadTimesDays: row.lead_times_days,
        emailEnabled: true,
        pushEnabled: true,
      },
    ])
  );

  const { data: subscriptionRows, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id, renewal_date, status, groups!inner(workspace_id)")
    .eq("status", "active")
    .lte(
      "renewal_date",
      new Date(now.getTime() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10)
    );
  if (subscriptionsError) {
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }

  const plans = collectDueNotificationPlans({
    now,
    subscriptions: ((subscriptionRows ?? []) as SubscriptionRow[])
      .map((row) => {
        const group = first(row.groups);
        if (!group?.workspace_id) return null;
        return {
          id: row.id,
          workspaceId: group.workspace_id,
          renewalDate: row.renewal_date,
          status: row.status,
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null),
    prefsByWorkspaceId,
  });

  const reminderMap = new Map<
    string,
    {
      workspaceId: string;
      subscriptionId: string;
      renewalDate: string;
      leadTimeDays: number;
      scheduledFor: string;
    }
  >();
  for (const plan of plans) {
    const key = `${plan.workspaceId}:${plan.subscriptionId}:${plan.leadTimeDays}:${plan.renewalDate}`;
    if (!reminderMap.has(key)) {
      reminderMap.set(key, {
        workspaceId: plan.workspaceId,
        subscriptionId: plan.subscriptionId,
        renewalDate: plan.renewalDate,
        leadTimeDays: plan.leadTimeDays,
        scheduledFor: plan.scheduledFor,
      });
    }
  }

  const workspaceIds = [...new Set([...reminderMap.values()].map((value) => value.workspaceId))];
  const { data: destinationRows } = workspaceIds.length
    ? await supabase
        .from("notification_destinations")
        .select("id, workspace_id, channel, target_url, secret_header, is_enabled")
        .in("workspace_id", workspaceIds)
        .eq("is_enabled", true)
    : { data: [] as DestinationRow[] };

  const destinationsByWorkspace = new Map<string, DestinationRow[]>();
  for (const row of (destinationRows ?? []) as DestinationRow[]) {
    const current = destinationsByWorkspace.get(row.workspace_id) ?? [];
    current.push(row);
    destinationsByWorkspace.set(row.workspace_id, current);
  }

  const jobsToInsert: Array<{
    workspace_id: string;
    subscription_id: string;
    destination_id: string | null;
    channel: NotificationChannel;
    lead_time_days: number;
    renewal_date: string;
    scheduled_for: string;
    idempotency_key: string;
  }> = [];

  for (const reminder of reminderMap.values()) {
    const prefs = (prefsRows ?? []).find((row) => row.workspace_id === reminder.workspaceId) as
      | NotificationPrefsRow
      | undefined;
    if (prefs?.email_enabled) {
      jobsToInsert.push({
        workspace_id: reminder.workspaceId,
        subscription_id: reminder.subscriptionId,
        destination_id: null,
        channel: "email",
        lead_time_days: reminder.leadTimeDays,
        renewal_date: reminder.renewalDate,
        scheduled_for: reminder.scheduledFor,
        idempotency_key: `${reminder.subscriptionId}:${reminder.leadTimeDays}:${reminder.renewalDate}:email`,
      });
    }
    if (prefs?.push_enabled) {
      jobsToInsert.push({
        workspace_id: reminder.workspaceId,
        subscription_id: reminder.subscriptionId,
        destination_id: null,
        channel: "push",
        lead_time_days: reminder.leadTimeDays,
        renewal_date: reminder.renewalDate,
        scheduled_for: reminder.scheduledFor,
        idempotency_key: `${reminder.subscriptionId}:${reminder.leadTimeDays}:${reminder.renewalDate}:push`,
      });
    }
    for (const destination of destinationsByWorkspace.get(reminder.workspaceId) ?? []) {
      if (destination.channel === "email" || destination.channel === "push") continue;
      jobsToInsert.push({
        workspace_id: reminder.workspaceId,
        subscription_id: reminder.subscriptionId,
        destination_id: destination.id,
        channel: destination.channel,
        lead_time_days: reminder.leadTimeDays,
        renewal_date: reminder.renewalDate,
        scheduled_for: reminder.scheduledFor,
        idempotency_key: `${reminder.subscriptionId}:${reminder.leadTimeDays}:${reminder.renewalDate}:${destination.id}`,
      });
    }
  }

  if (jobsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("notification_jobs").upsert(jobsToInsert, {
      onConflict: "workspace_id,idempotency_key",
      ignoreDuplicates: true,
    });
    if (insertError) {
      return NextResponse.json({ error: "Failed to create jobs" }, { status: 500 });
    }
  }

  const { data: pendingJobs, error: pendingError } = await supabase
    .from("notification_jobs")
    .select(
      "id, workspace_id, subscription_id, destination_id, channel, lead_time_days, renewal_date, attempt_count, subscriptions!inner(vendor_name, amount, currency, groups!inner(name, workspace_id, workspaces!inner(owner_user_id, name))), notification_destinations(target_url, secret_header)"
    )
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(200);

  if (pendingError) {
    return NextResponse.json({ error: "Failed to load pending jobs" }, { status: 500 });
  }

  const workspaceIdsWithPush = [
    ...new Set(((pendingJobs ?? []) as PendingJobRow[]).map((job) => job.workspace_id)),
  ];
  const pushByWorkspaceId = new Map<string, PushSubscriptionJSON[]>();
  if (workspaceIdsWithPush.length > 0) {
    const { data: pushRows } = await supabase
      .from("push_subscriptions")
      .select("workspace_id, subscription_json")
      .in("workspace_id", workspaceIdsWithPush);
    for (const row of (pushRows ?? []) as PushSubscriptionRow[]) {
      const current = pushByWorkspaceId.get(row.workspace_id) ?? [];
      current.push(row.subscription_json);
      pushByWorkspaceId.set(row.workspace_id, current);
    }
  }

  let sent = 0;
  let failed = 0;
  let retried = 0;
  for (const job of (pendingJobs ?? []) as PendingJobRow[]) {
    try {
      const subscription = first(job.subscriptions);
      const group = first(subscription?.groups);
      const workspace = first(group?.workspaces);
      if (!subscription || !group || !workspace) {
        throw new Error("Missing relational data");
      }

      const context = {
        workspaceName: workspace.name,
        groupName: group.name,
        vendorName: subscription.vendor_name,
        amount: Number(subscription.amount ?? 0),
        currency: subscription.currency,
        renewalDate: job.renewal_date,
        leadTimeDays: job.lead_time_days,
      };

      if (job.channel === "email") {
        const userResponse = await supabase.auth.admin.getUserById(workspace.owner_user_id);
        const email = userResponse.data?.user?.email;
        if (!email) throw new Error("Workspace owner has no email");
        await dispatchNotification(context, { channel: "email", email });
      } else if (job.channel === "push") {
        await dispatchNotification(context, {
          channel: "push",
          pushSubscriptions: pushByWorkspaceId.get(job.workspace_id) ?? [],
        });
      } else {
        const destination = first(job.notification_destinations);
        await dispatchNotification(context, {
          channel: job.channel,
          webhookUrl: destination?.target_url ?? undefined,
          secretHeader: destination?.secret_header ?? null,
        });
      }

      await supabase
        .from("notification_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempt_count: (job.attempt_count ?? 0) + 1,
          error: null,
        })
        .eq("id", job.id);
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown send failure";
      const attempts = (job.attempt_count ?? 0) + 1;
      if (attempts < 3) {
        const nextSchedule = new Date(now.getTime() + attempts * 5 * 60 * 1000).toISOString();
        await supabase
          .from("notification_jobs")
          .update({
            status: "pending",
            scheduled_for: nextSchedule,
            attempt_count: attempts,
            error: message,
          })
          .eq("id", job.id);
        retried += 1;
      } else {
        await supabase
          .from("notification_jobs")
          .update({
            status: "failed",
            attempt_count: attempts,
            error: message,
          })
          .eq("id", job.id);
        failed += 1;
      }
    }
  }

  for (const workspaceId of workspaceIds) {
    await syncWorkspaceCalendar(workspaceId).catch((calendarError) => {
      log.warn("calendar_sync_skipped", {
        runId,
        workspaceId,
        error: calendarError instanceof Error ? calendarError.message : "unknown",
      });
    });
  }

  return NextResponse.json({
    ok: true,
    runId,
    plansEvaluated: plans.length,
    jobsCreated: jobsToInsert.length,
    sent,
    failed,
    retried,
  });
}
