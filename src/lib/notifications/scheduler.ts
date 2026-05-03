export type NotificationChannel = "email" | "push";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type SchedulingSubscription = {
  id: string;
  workspaceId: string;
  renewalDate: string; // YYYY-MM-DD
  status: SubscriptionStatus;
  /** Last billing day (YYYY-MM-DD); no reminders for renewals after this. */
  termEndDateYmd?: string | null;
};

export type SchedulingPrefs = {
  leadTimesDays: number[];
  emailEnabled: boolean;
  pushEnabled: boolean;
};

export type DueNotificationPlan = {
  workspaceId: string;
  subscriptionId: string;
  channel: NotificationChannel;
  leadTimeDays: number;
  renewalDate: string;
  scheduledFor: string;
  idempotencyKey: string;
};

const DEFAULT_PREFS: SchedulingPrefs = {
  leadTimesDays: [7, 3, 1],
  emailEnabled: true,
  pushEnabled: false,
};

export function uniqueSortedLeadTimes(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value > 0))].sort(
    (a, b) => b - a
  );
}

function dateAtUtcMidnight(dateLike: string): Date {
  return new Date(`${dateLike}T00:00:00.000Z`);
}

function toIsoUtc(date: Date): string {
  return date.toISOString();
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

export function buildIdempotencyKey(args: {
  subscriptionId: string;
  channel: NotificationChannel;
  leadTimeDays: number;
  renewalDate: string;
}): string {
  return `${args.subscriptionId}:${args.channel}:${args.leadTimeDays}:${args.renewalDate}`;
}

export function collectDueNotificationPlans(args: {
  now: Date;
  subscriptions: SchedulingSubscription[];
  prefsByWorkspaceId: Record<string, SchedulingPrefs>;
}): DueNotificationPlan[] {
  const duePlans: DueNotificationPlan[] = [];

  for (const subscription of args.subscriptions) {
    if (subscription.status !== "active") continue;

    const prefs = args.prefsByWorkspaceId[subscription.workspaceId] ?? DEFAULT_PREFS;
    const leadTimes = uniqueSortedLeadTimes(prefs.leadTimesDays);
    if (leadTimes.length === 0) continue;

    const renewalUtc = dateAtUtcMidnight(subscription.renewalDate);
    const termEnd = subscription.termEndDateYmd?.trim();
    if (termEnd && subscription.renewalDate > termEnd) continue;

    const channels: NotificationChannel[] = [];
    if (prefs.emailEnabled) channels.push("email");
    if (prefs.pushEnabled) channels.push("push");
    if (channels.length === 0) continue;

    for (const leadTimeDays of leadTimes) {
      const scheduledFor = subtractDays(renewalUtc, leadTimeDays);
      if (scheduledFor > args.now) continue;

      for (const channel of channels) {
        duePlans.push({
          workspaceId: subscription.workspaceId,
          subscriptionId: subscription.id,
          channel,
          leadTimeDays,
          renewalDate: subscription.renewalDate,
          scheduledFor: toIsoUtc(scheduledFor),
          idempotencyKey: buildIdempotencyKey({
            subscriptionId: subscription.id,
            channel,
            leadTimeDays,
            renewalDate: subscription.renewalDate,
          }),
        });
      }
    }
  }

  return duePlans.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}
