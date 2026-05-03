import {
  deleteGoogleEvent,
  refreshGoogleAccessToken,
  upsertGoogleEvent,
} from "@/lib/calendar/google";
import { supabaseService } from "@/lib/supabase/server";
import {
  recurrenceTouchesDaySet,
  recurrenceTouchesMonth,
  nextOccurrenceDayKeyOnOrAfter,
  type SubscriptionCadence,
} from "@/lib/subscriptions/recurrence";

type IntegrationRow = {
  workspace_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  calendar_id: string;
};

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  cadence: SubscriptionCadence;
  renewal_date: string;
  status: "active" | "paused" | "cancelled";
  groups: { name: string } | Array<{ name: string }> | null;
};

type CalendarEventRow = {
  subscription_id: string;
  external_event_id: string;
};

export type CalendarSyncScope = "all" | "month" | "days";

export type CalendarSyncSelection = {
  scope?: CalendarSyncScope;
  month?: string | null;
  dates?: string[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function matchesSyncSelection(
  renewalDate: string,
  cadence: SubscriptionCadence,
  selection?: CalendarSyncSelection
) {
  const scope = selection?.scope ?? "all";
  if (scope === "all") return true;
  if (scope === "month") {
    const month = selection?.month?.trim();
    if (!month) return true;
    return recurrenceTouchesMonth(renewalDate, cadence, month);
  }
  if (scope === "days") {
    const days = new Set((selection?.dates ?? []).map((value) => value.trim()).filter(Boolean));
    return recurrenceTouchesDaySet(renewalDate, cadence, days);
  }
  return true;
}

function calendarEventCopy(subscription: SubscriptionRow, billingDateYmd: string) {
  const group = first(subscription.groups);
  const amt = Number(subscription.amount);
  const amountLabel = Number.isFinite(amt) ? amt.toFixed(2) : "—";
  const title = `${subscription.vendor_name} · ${amountLabel} ${subscription.currency} · ${billingDateYmd}`;
  const description = [
    `Pay: ${amountLabel} ${subscription.currency}`,
    `Due: ${billingDateYmd}`,
    `Group: ${group?.name ?? "General"}`,
    "Managed in Boopy",
  ].join("\n");
  return { title, description };
}

export async function syncWorkspaceCalendar(
  workspaceId: string,
  selection?: CalendarSyncSelection
) {
  const supabase = supabaseService();
  const { data: integration } = await supabase
    .from("calendar_integrations")
    .select("workspace_id, access_token, refresh_token, token_expires_at, calendar_id")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google")
    .maybeSingle();
  if (!integration) return;

  const config = integration as IntegrationRow;
  let accessToken = config.access_token;
  const refreshToken = config.refresh_token;
  const expiresAt = config.token_expires_at ? new Date(config.token_expires_at).getTime() : null;
  const shouldRefresh =
    !accessToken ||
    (expiresAt !== null && Number.isFinite(expiresAt) && Date.now() >= expiresAt - 60_000);
  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshGoogleAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    const nextExpiry =
      refreshed.expires_in && Number.isFinite(refreshed.expires_in)
        ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
        : null;
    await supabase
      .from("calendar_integrations")
      .update({
        access_token: refreshed.access_token,
        token_expires_at: nextExpiry,
      })
      .eq("workspace_id", workspaceId)
      .eq("provider", "google");
  }
  if (!accessToken) return;

  const isFullSync = !selection || (selection.scope ?? "all") === "all";

  const [{ data: subscriptions }, { data: mappedEvents }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, vendor_name, amount, currency, cadence, renewal_date, status, groups(name)")
      .eq("status", "active")
      .eq("groups.workspace_id", workspaceId),
    supabase
      .from("calendar_events")
      .select("subscription_id, external_event_id")
      .eq("workspace_id", workspaceId)
      .eq("provider", "google"),
  ]);

  const eventBySubscription = new Map<string, string>();
  for (const row of (mappedEvents ?? []) as CalendarEventRow[]) {
    eventBySubscription.set(row.subscription_id, row.external_event_id);
  }

  for (const subscription of (subscriptions ?? []) as SubscriptionRow[]) {
    if (!matchesSyncSelection(subscription.renewal_date, subscription.cadence, selection)) {
      continue;
    }
    const billingDate =
      nextOccurrenceDayKeyOnOrAfter(subscription.renewal_date, subscription.cadence, new Date()) ??
      subscription.renewal_date;
    const { title, description } = calendarEventCopy(subscription, billingDate);
    let upserted;
    try {
      upserted = await upsertGoogleEvent({
        accessToken,
        calendarId: config.calendar_id || "primary",
        eventId: eventBySubscription.get(subscription.id),
        title,
        description,
        date: billingDate,
      });
    } catch (error) {
      if (
        refreshToken &&
        error instanceof Error &&
        error.message.includes("Google calendar upsert failed (401)")
      ) {
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        accessToken = refreshed.access_token;
        const nextExpiry =
          refreshed.expires_in && Number.isFinite(refreshed.expires_in)
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null;
        await supabase
          .from("calendar_integrations")
          .update({
            access_token: refreshed.access_token,
            token_expires_at: nextExpiry,
          })
          .eq("workspace_id", workspaceId)
          .eq("provider", "google");
        upserted = await upsertGoogleEvent({
          accessToken,
          calendarId: config.calendar_id || "primary",
          eventId: eventBySubscription.get(subscription.id),
          title,
          description,
          date: billingDate,
        });
      } else {
        throw error;
      }
    }
    await supabase.from("calendar_events").upsert(
      {
        workspace_id: workspaceId,
        subscription_id: subscription.id,
        provider: "google",
        external_event_id: upserted.id,
      },
      { onConflict: "workspace_id,subscription_id,provider" }
    );
  }

  if (isFullSync) {
    await pruneInactiveGoogleEvents({
      supabase,
      workspaceId,
      calendarId: config.calendar_id || "primary",
      accessToken,
      refreshToken,
    });
  }
}

async function pruneInactiveGoogleEvents(args: {
  supabase: ReturnType<typeof supabaseService>;
  workspaceId: string;
  calendarId: string;
  accessToken: string;
  refreshToken: string | null;
}) {
  const { supabase, workspaceId, calendarId, refreshToken } = args;
  let accessToken = args.accessToken;

  const { data: mappings } = await supabase
    .from("calendar_events")
    .select("subscription_id, external_event_id")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google");

  const { data: workspaceSubs } = await supabase
    .from("subscriptions")
    .select("id, status, groups!inner(workspace_id)")
    .eq("groups.workspace_id", workspaceId);

  const activeIds = new Set(
    (workspaceSubs ?? []).filter((row) => row.status === "active").map((row) => row.id as string)
  );

  for (const row of (mappings ?? []) as { subscription_id: string; external_event_id: string }[]) {
    if (activeIds.has(row.subscription_id)) continue;

    try {
      await deleteGoogleEvent({
        accessToken,
        calendarId,
        eventId: row.external_event_id,
      });
    } catch (error) {
      if (
        refreshToken &&
        error instanceof Error &&
        error.message.includes("Google calendar delete failed (401)")
      ) {
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        accessToken = refreshed.access_token;
        await supabase
          .from("calendar_integrations")
          .update({
            access_token: refreshed.access_token,
            token_expires_at:
              refreshed.expires_in && Number.isFinite(refreshed.expires_in)
                ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
                : null,
          })
          .eq("workspace_id", workspaceId)
          .eq("provider", "google");
        await deleteGoogleEvent({
          accessToken,
          calendarId,
          eventId: row.external_event_id,
        });
      } else {
        throw error;
      }
    }

    await supabase
      .from("calendar_events")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("provider", "google")
      .eq("subscription_id", row.subscription_id);
  }
}

/** Removes the mapped Google event and `calendar_events` row before deleting a subscription (avoids orphan calendar events). */
export async function removeGoogleCalendarEventForSubscription(
  workspaceId: string,
  subscriptionId: string
) {
  const supabase = supabaseService();
  const { data: integration } = await supabase
    .from("calendar_integrations")
    .select("access_token, refresh_token, token_expires_at, calendar_id")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google")
    .maybeSingle();
  if (!integration) return;

  const { data: mapping } = await supabase
    .from("calendar_events")
    .select("external_event_id")
    .eq("workspace_id", workspaceId)
    .eq("subscription_id", subscriptionId)
    .eq("provider", "google")
    .maybeSingle();
  if (!mapping?.external_event_id) return;

  const calendarId = (integration.calendar_id as string) || "primary";
  let accessToken = integration.access_token as string | null;
  const refreshToken = integration.refresh_token as string | null;
  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at as string).getTime()
    : null;
  const shouldRefresh =
    !accessToken ||
    (expiresAt !== null && Number.isFinite(expiresAt) && Date.now() >= expiresAt - 60_000);
  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshGoogleAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    await supabase
      .from("calendar_integrations")
      .update({
        access_token: refreshed.access_token,
        token_expires_at:
          refreshed.expires_in && Number.isFinite(refreshed.expires_in)
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null,
      })
      .eq("workspace_id", workspaceId)
      .eq("provider", "google");
  }
  if (!accessToken) return;

  try {
    await deleteGoogleEvent({
      accessToken,
      calendarId,
      eventId: mapping.external_event_id,
    });
  } catch (error) {
    if (
      refreshToken &&
      error instanceof Error &&
      error.message.includes("Google calendar delete failed (401)")
    ) {
      const refreshed = await refreshGoogleAccessToken(refreshToken);
      accessToken = refreshed.access_token;
      await supabase
        .from("calendar_integrations")
        .update({
          access_token: refreshed.access_token,
          token_expires_at:
            refreshed.expires_in && Number.isFinite(refreshed.expires_in)
              ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
              : null,
        })
        .eq("workspace_id", workspaceId)
        .eq("provider", "google");
      await deleteGoogleEvent({
        accessToken,
        calendarId,
        eventId: mapping.external_event_id,
      });
    } else {
      throw error;
    }
  }

  await supabase
    .from("calendar_events")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("subscription_id", subscriptionId)
    .eq("provider", "google");
}
