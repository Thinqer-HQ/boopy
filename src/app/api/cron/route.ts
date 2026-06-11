import { NextResponse } from "next/server";

import { syncWorkspaceCalendar } from "@/lib/calendar/sync";
import { scanDriveForWorkspace } from "@/lib/drive/scan";
import { getEnv } from "@/lib/env";
import { log } from "@/lib/log";
import { sendRenewalDigestEmail } from "@/lib/notifications/email";
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
  end_date: string | null;
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

type NotificationContext = {
  workspaceName: string;
  groupName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
  ownerUserId: string;
};

type DigestRunRow = {
  id: string;
  status: "pending" | "sent" | "failed";
  attempt_count: number;
  next_attempt_at: string | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function authErrorResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function buildContextFromPendingJob(job: PendingJobRow): NotificationContext {
  const subscription = first(job.subscriptions);
  const group = first(subscription?.groups);
  const workspace = first(group?.workspaces);
  if (!subscription || !group || !workspace) {
    throw new Error("Missing relational data");
  }
  return {
    workspaceName: workspace.name,
    groupName: group.name,
    vendorName: subscription.vendor_name,
    amount: Number(subscription.amount ?? 0),
    currency: subscription.currency,
    renewalDate: job.renewal_date,
    leadTimeDays: job.lead_time_days,
    ownerUserId: workspace.owner_user_id,
  };
}

function floorToUtcHour(date: Date) {
  const value = new Date(date);
  value.setUTCMinutes(0, 0, 0);
  return value;
}

function nextUtcHour(date: Date) {
  const value = floorToUtcHour(date);
  value.setUTCHours(value.getUTCHours() + 1);
  return value;
}

function computeNextRetryAt(now: Date, attempts: number) {
  const baseMinutes = Math.min(60, 5 * 2 ** Math.max(0, attempts - 1));
  const jitterSeconds = Math.floor(Math.random() * 31);
  return new Date(now.getTime() + baseMinutes * 60 * 1000 + jitterSeconds * 1000);
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
        emailEnabled: row.email_enabled,
        pushEnabled: row.push_enabled,
      },
    ])
  );

  const todayYmd = new Date().toISOString().slice(0, 10);
  const { data: subscriptionRows, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id, renewal_date, status, end_date, groups!inner(workspace_id)")
    .eq("status", "active")
    .lte(
      "renewal_date",
      new Date(now.getTime() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10)
    )
    .or(`end_date.is.null,end_date.gte.${todayYmd}`);
  if (subscriptionsError) {
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }

  const plans = collectDueNotificationPlans({
    now,
    subscriptions: ((subscriptionRows ?? []) as SubscriptionRow[])
      .map((row) => {
        const group = first(row.groups);
        if (!group?.workspace_id) return null;
        const termEnd = row.end_date?.trim() ?? null;
        if (termEnd && row.renewal_date > termEnd) return null;
        return {
          id: row.id,
          workspaceId: group.workspace_id,
          renewalDate: row.renewal_date,
          status: row.status,
          termEndDateYmd: termEnd,
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
  let digestsSent = 0;
  let digestsFailed = 0;
  let digestsRetried = 0;

  const pendingJobRows = (pendingJobs ?? []) as PendingJobRow[];
  const emailJobsByWorkspace = new Map<
    string,
    Array<{ job: PendingJobRow; context: NotificationContext }>
  >();
  const nonEmailJobs: Array<{ job: PendingJobRow; context: NotificationContext }> = [];

  for (const job of pendingJobRows) {
    try {
      const context = buildContextFromPendingJob(job);
      if (job.channel === "email") {
        const current = emailJobsByWorkspace.get(job.workspace_id) ?? [];
        current.push({ job, context });
        emailJobsByWorkspace.set(job.workspace_id, current);
      } else {
        nonEmailJobs.push({ job, context });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown send failure";
      const attempts = (job.attempt_count ?? 0) + 1;
      if (attempts < 3) {
        const nextSchedule = computeNextRetryAt(now, attempts).toISOString();
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

  for (const [workspaceId, groupedJobs] of emailJobsByWorkspace.entries()) {
    const windowStart = floorToUtcHour(now);
    const windowEnd = nextUtcHour(now);
    const idempotencyKey = `${workspaceId}:email:${windowStart.toISOString()}`;
    const ownerUserId = groupedJobs[0]?.context.ownerUserId;
    const workspaceName = groupedJobs[0]?.context.workspaceName ?? "Workspace";
    if (!ownerUserId) {
      continue;
    }

    await supabase.from("notification_digest_runs").upsert(
      {
        workspace_id: workspaceId,
        channel: "email",
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        idempotency_key: idempotencyKey,
      },
      {
        onConflict: "workspace_id,channel,window_start",
        ignoreDuplicates: true,
      }
    );

    const { data: digestRun, error: digestSelectError } = await supabase
      .from("notification_digest_runs")
      .select("id, status, attempt_count, next_attempt_at")
      .eq("workspace_id", workspaceId)
      .eq("channel", "email")
      .eq("window_start", windowStart.toISOString())
      .single();
    const digest = (digestRun as DigestRunRow | null) ?? null;
    if (digestSelectError || !digest) {
      for (const { job } of groupedJobs) {
        const attempts = (job.attempt_count ?? 0) + 1;
        const nextSchedule = computeNextRetryAt(now, attempts).toISOString();
        await supabase
          .from("notification_jobs")
          .update({
            status: "pending",
            scheduled_for: nextSchedule,
            attempt_count: attempts,
            error: "Failed to resolve digest run",
          })
          .eq("id", job.id);
        retried += 1;
      }
      continue;
    }

    if (digest.status === "sent") {
      continue;
    }
    if (digest.next_attempt_at && new Date(digest.next_attempt_at) > now) {
      continue;
    }

    try {
      const userResponse = await supabase.auth.admin.getUserById(ownerUserId);
      const email = userResponse.data?.user?.email;
      if (!email) throw new Error("Workspace owner has no email");

      const digestItemsByKey = new Map<
        string,
        {
          groupName: string;
          vendorName: string;
          amount: number;
          currency: string;
          renewalDate: string;
          leadTimeDays: number;
        }
      >();
      for (const { job, context } of groupedJobs) {
        const key = `${job.subscription_id}:${job.renewal_date}`;
        const existing = digestItemsByKey.get(key);
        if (!existing || context.leadTimeDays < existing.leadTimeDays) {
          digestItemsByKey.set(key, {
            groupName: context.groupName,
            vendorName: context.vendorName,
            amount: context.amount,
            currency: context.currency,
            renewalDate: context.renewalDate,
            leadTimeDays: context.leadTimeDays,
          });
        }
      }

      const providerMessageId = await sendRenewalDigestEmail({
        to: email,
        workspaceName,
        items: [...digestItemsByKey.values()],
      });

      const digestAttempts = (digest.attempt_count ?? 0) + 1;
      await supabase
        .from("notification_digest_runs")
        .update({
          status: "sent",
          attempt_count: digestAttempts,
          provider_message_id: providerMessageId,
          last_error: null,
          last_attempt_at: new Date().toISOString(),
          next_attempt_at: null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", digest.id);
      digestsSent += 1;

      for (const { job } of groupedJobs) {
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
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown digest send failure";
      const digestAttempts = (digest.attempt_count ?? 0) + 1;
      const digestShouldRetry = digestAttempts < 5;
      const nextDigestAttemptAt = digestShouldRetry
        ? computeNextRetryAt(now, digestAttempts).toISOString()
        : null;

      await supabase
        .from("notification_digest_runs")
        .update({
          status: digestShouldRetry ? "pending" : "failed",
          attempt_count: digestAttempts,
          last_error: message,
          last_attempt_at: new Date().toISOString(),
          next_attempt_at: nextDigestAttemptAt,
        })
        .eq("id", digest.id);
      if (digestShouldRetry) {
        digestsRetried += 1;
      } else {
        digestsFailed += 1;
      }

      for (const { job } of groupedJobs) {
        const attempts = (job.attempt_count ?? 0) + 1;
        if (attempts < 3) {
          const nextSchedule = computeNextRetryAt(now, attempts).toISOString();
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
  }

  for (const { job, context } of nonEmailJobs) {
    try {
      if (job.channel === "push") {
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
        const nextSchedule = computeNextRetryAt(now, attempts).toISOString();
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

  const { data: calendarWorkspaceRows } = await supabase
    .from("calendar_integrations")
    .select("workspace_id")
    .eq("provider", "google");
  const calendarWorkspaceIds = [
    ...new Set((calendarWorkspaceRows ?? []).map((row) => row.workspace_id as string)),
  ];

  for (const workspaceId of calendarWorkspaceIds) {
    await syncWorkspaceCalendar(workspaceId).catch((calendarError) => {
      log.warn("calendar_sync_skipped", {
        runId,
        workspaceId,
        error: calendarError instanceof Error ? calendarError.message : "unknown",
      });
    });
  }

  const { data: driveWorkspaceRows } = await supabase
    .from("drive_integrations")
    .select("workspace_id")
    .eq("enabled", true);
  const driveWorkspaceIds = (driveWorkspaceRows ?? []).map((row) => row.workspace_id as string);
  let driveSynced = 0;

  for (const workspaceId of driveWorkspaceIds) {
    await scanDriveForWorkspace(workspaceId)
      .then(() => {
        driveSynced += 1;
      })
      .catch((driveError) => {
        log.warn("drive_sync_skipped", {
          runId,
          workspaceId,
          error: driveError instanceof Error ? driveError.message : "unknown",
        });
      });
  }

  return NextResponse.json({
    ok: true,
    runId,
    plansEvaluated: plans.length,
    jobsCreated: jobsToInsert.length,
    digestsSent,
    digestsFailed,
    digestsRetried,
    sent,
    failed,
    retried,
    driveSynced,
  });
}
