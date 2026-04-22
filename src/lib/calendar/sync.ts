import { refreshGoogleAccessToken, upsertGoogleEvent } from "@/lib/calendar/google";
import { supabaseService } from "@/lib/supabase/server";

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

function matchesSyncSelection(renewalDate: string, selection?: CalendarSyncSelection) {
  const scope = selection?.scope ?? "all";
  if (scope === "all") return true;
  if (scope === "month") {
    const month = selection?.month?.trim();
    if (!month) return true;
    return renewalDate.startsWith(`${month}-`);
  }
  if (scope === "days") {
    const days = new Set((selection?.dates ?? []).map((value) => value.trim()).filter(Boolean));
    return days.size > 0 && days.has(renewalDate);
  }
  return true;
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

  const [{ data: subscriptions }, { data: mappedEvents }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, vendor_name, renewal_date, status, groups(name)")
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
    if (!matchesSyncSelection(subscription.renewal_date, selection)) {
      continue;
    }
    const group = first(subscription.groups);
    let upserted;
    try {
      upserted = await upsertGoogleEvent({
        accessToken,
        calendarId: config.calendar_id || "primary",
        eventId: eventBySubscription.get(subscription.id),
        title: `${subscription.vendor_name} renewal`,
        description: `Boopy reminder for ${group?.name ?? "General"}`,
        date: subscription.renewal_date,
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
          title: `${subscription.vendor_name} renewal`,
          description: `Boopy reminder for ${group?.name ?? "General"}`,
          date: subscription.renewal_date,
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
}
