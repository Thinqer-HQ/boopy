"use client";

import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  RefreshCw,
  Settings,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";
import { DestinationForm } from "@/components/boopy/notifications/destination-form";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { base64UrlToUint8Array, isValidVapidPublicKey } from "@/lib/notifications/vapid";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type NotificationStatus = {
  prefs: { email_enabled: boolean; push_enabled: boolean; lead_times_days: number[] } | null;
  jobs: { pending: number; sent: number; failed: number; total: number };
  destinations: { total: number; enabled: number };
  pushSubscriptions: number;
};

function parseLeadTimes(raw: string): number[] {
  return [...new Set(raw.split(",").map((token) => Number.parseInt(token.trim(), 10)))]
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => b - a);
}

export default function NotificationsPage() {
  const { state } = usePrimaryWorkspace();
  const searchParams = useSearchParams();

  // ── status ──
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── settings ──
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leadTimesText, setLeadTimesText] = useState("7,3,1");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushReady, setPushReady] = useState(false);
  const [pushWorking, setPushWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [settingsErr, setSettingsErr] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<
    Array<{
      id: string;
      channel: "slack" | "discord" | "webhook";
      name: string;
      target_url: string | null;
      is_enabled: boolean;
    }>
  >([]);

  useEffect(() => {
    setPushReady(
      typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
    );
  }, []);

  useEffect(() => {
    const cal = searchParams.get("calendar");
    if (cal === "connected") {
      setSettingsMsg("Google Calendar connected.");
      setSettingsOpen(true);
    } else if (cal === "error") {
      setSettingsErr("Google Calendar connection failed. Try again.");
      setSettingsOpen(true);
    }
  }, [searchParams]);

  // ── load status ──
  const loadStatus = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setStatusError("You are not signed in.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/notifications/status?workspaceId=${state.workspaceId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      prefs?: NotificationStatus["prefs"];
      jobs?: NotificationStatus["jobs"];
      destinations?: NotificationStatus["destinations"];
      pushSubscriptions?: number;
    };
    setLoading(false);
    if (!res.ok) {
      setStatusError(payload.error ?? "Failed to load notification status.");
      return;
    }
    setStatusError(null);
    setStatus({
      prefs: payload.prefs ?? null,
      jobs: payload.jobs ?? { pending: 0, sent: 0, failed: 0, total: 0 },
      destinations: payload.destinations ?? { total: 0, enabled: 0 },
      pushSubscriptions: payload.pushSubscriptions ?? 0,
    });
  }, [state]);

  // ── load settings ──
  const loadSettings = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("notification_prefs")
      .select("lead_times_days, email_enabled, push_enabled")
      .eq("workspace_id", state.workspaceId)
      .maybeSingle();
    if (loadError) {
      setSettingsErr(loadError.message);
      return;
    }
    if (data) {
      setLeadTimesText((data.lead_times_days ?? [7, 3, 1]).join(","));
      setEmailEnabled(Boolean(data.email_enabled));
      setPushEnabled(Boolean(data.push_enabled));
    }
    const { data: destRows, error: destError } = await supabase
      .from("notification_destinations")
      .select("id, channel, name, target_url, is_enabled")
      .eq("workspace_id", state.workspaceId)
      .order("created_at", { ascending: false });
    if (destError) {
      setSettingsErr(destError.message);
      return;
    }
    setDestinations(
      (destRows ?? []) as Array<{
        id: string;
        channel: "slack" | "discord" | "webhook";
        name: string;
        target_url: string | null;
        is_enabled: boolean;
      }>
    );
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatus();
      void loadSettings();
    });
  }, [loadStatus, loadSettings]);

  async function handleSave() {
    if (state.status !== "ready") return;
    const leadTimes = parseLeadTimes(leadTimesText);
    if (leadTimes.length === 0) {
      setSettingsErr("Lead times must include at least one positive day (e.g. 7,3,1).");
      return;
    }
    setSaving(true);
    setSettingsMsg(null);
    setSettingsErr(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error: saveError } = await supabase.from("notification_prefs").upsert({
      workspace_id: state.workspaceId,
      lead_times_days: leadTimes,
      email_enabled: emailEnabled,
      push_enabled: pushEnabled,
    });
    setSaving(false);
    if (saveError) {
      setSettingsErr(saveError.message);
      return;
    }
    setLeadTimesText(leadTimes.join(","));
    setSettingsMsg("Settings saved.");
    void loadStatus();
  }

  async function enablePushOnDevice() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey || !isValidVapidPublicKey(vapidPublicKey)) {
      setSettingsErr("Push configuration is invalid (NEXT_PUBLIC_VAPID_PUBLIC_KEY).");
      return;
    }
    if (!pushReady) {
      setSettingsErr("Push is not supported in this browser.");
      return;
    }
    setPushWorking(true);
    setSettingsErr(null);
    setSettingsMsg(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("You are not signed in.");
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(vapidPublicKey.trim()),
        });
      }
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          workspaceId: state.workspaceId,
          subscription: subscription.toJSON(),
        }),
      });
      if (!response.ok) {
        const p = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(p.error ?? "Failed to save push subscription.");
      }
      setSettingsMsg("Push enabled on this device.");
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.message.includes("applicationServerKey is not valid")
      ) {
        setSettingsErr("Push configuration is invalid. Refresh after VAPID keys are updated.");
        return;
      }
      setSettingsErr(err instanceof Error ? err.message : "Failed to enable push.");
    } finally {
      setPushWorking(false);
    }
  }

  async function refreshDestinations() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("notification_destinations")
      .select("id, channel, name, target_url, is_enabled")
      .eq("workspace_id", state.workspaceId)
      .order("created_at", { ascending: false });
    if (error) return;
    setDestinations(
      (data ?? []) as Array<{
        id: string;
        channel: "slack" | "discord" | "webhook";
        name: string;
        target_url: string | null;
        is_enabled: boolean;
      }>
    );
  }

  async function addDestination(payload: {
    channel: "slack" | "discord" | "webhook";
    name: string;
    targetUrl: string;
    secretHeader?: string;
  }) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error } = await supabase.from("notification_destinations").insert({
      workspace_id: state.workspaceId,
      channel: payload.channel,
      name: payload.name,
      target_url: payload.targetUrl,
      secret_header: payload.secretHeader ?? null,
      is_enabled: true,
    });
    if (error) {
      setSettingsErr(error.message);
      return;
    }
    setSettingsMsg("Destination added.");
    await refreshDestinations();
  }

  async function toggleDestination(id: string, next: boolean) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error } = await supabase
      .from("notification_destinations")
      .update({ is_enabled: next })
      .eq("id", id)
      .eq("workspace_id", state.workspaceId);
    if (error) {
      setSettingsErr(error.message);
      return;
    }
    setSettingsMsg(next ? "Destination enabled." : "Destination disabled.");
    await refreshDestinations();
  }

  async function deleteDestination(id: string) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error } = await supabase
      .from("notification_destinations")
      .delete()
      .eq("id", id)
      .eq("workspace_id", state.workspaceId);
    if (error) {
      setSettingsErr(error.message);
      return;
    }
    setSettingsMsg("Destination removed.");
    await refreshDestinations();
  }

  async function sendDestinationTest(id: string) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch("/api/notifications/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId: state.workspaceId, destinationId: id }),
    });
    const p = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setSettingsErr(p.error ?? "Send-test failed.");
      return;
    }
    setSettingsMsg("Send-test succeeded.");
  }

  async function connectGoogleCalendar() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch(`/api/integrations/google/start?workspaceId=${state.workspaceId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const p = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!res.ok || !p.url) {
      setSettingsErr(p.error ?? "Failed to start Google connect.");
      return;
    }
    window.location.href = p.url;
  }

  async function triggerCalendarResync() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId: state.workspaceId }),
    });
    const p = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setSettingsErr(p.error ?? "Calendar re-sync failed.");
      return;
    }
    setSettingsMsg("Calendar re-sync started.");
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready")
    return <div className="text-muted-foreground p-8 text-sm">Loading notifications…</div>;

  const healthy = !status || status.jobs.failed === 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Reminder delivery health across all channels.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => void loadStatus()}>
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {statusError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      )}

      {/* ── Health banner ── */}
      {status && (
        <div
          className={cn(
            "overflow-hidden rounded-xl border",
            healthy
              ? "to-card border-[#1faa6b]/20 bg-gradient-to-r from-[#e4f6ee]"
              : "border-destructive/20 from-destructive/5 to-card bg-gradient-to-r"
          )}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            <BoopyLottieMascot
              className="relative hidden size-12 shrink-0 sm:block"
              emotion={healthy ? "boopy-good" : "boopy-no"}
              reducedMotionBehavior="fallback-image"
            />
            <div>
              <p className={cn("font-semibold", healthy ? "text-[#1faa6b]" : "text-destructive")}>
                {healthy
                  ? "All channels healthy"
                  : `${status.jobs.failed} failed job${status.jobs.failed !== 1 ? "s" : ""}`}
              </p>
              <p className="text-muted-foreground text-sm">
                {status.jobs.sent} sent · {status.jobs.pending} queued · {status.jobs.failed} failed
                in the last 30 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat strip ── */}
      <div className="bg-card border-border flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border px-4 py-2.5">
        {(
          [
            { label: "Pending", value: status?.jobs.pending ?? 0, warn: false },
            {
              label: "Failed",
              value: status?.jobs.failed ?? 0,
              warn: (status?.jobs.failed ?? 0) > 0,
            },
            { label: "Sent (30d)", value: status?.jobs.sent ?? 0, warn: false },
            { label: "Total jobs", value: status?.jobs.total ?? 0, warn: false },
          ] as const
        ).map(({ label, value, warn }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span
              className={cn(
                "font-heading text-xl leading-none font-semibold tabular-nums",
                warn && "text-destructive"
              )}
            >
              {value}
            </span>
          </div>
        ))}
        <div className="ml-auto flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs">Destinations</span>
          <span className="font-heading text-xl leading-none font-semibold tabular-nums">
            {status?.destinations.enabled ?? 0}
            <span className="text-muted-foreground text-sm font-normal">
              /{status?.destinations.total ?? 0}
            </span>
          </span>
        </div>
      </div>

      {/* ── Channel readiness ── */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-b px-4 py-2.5">
          <h2 className="text-sm font-semibold">Channel readiness</h2>
        </div>
        {[
          {
            icon: <Mail className="size-4" />,
            label: "Email reminders",
            value: status?.prefs?.email_enabled,
          },
          {
            icon: <Smartphone className="size-4" />,
            label: "Push reminders",
            value: status?.prefs?.push_enabled,
            sub: status?.pushSubscriptions
              ? `${status.pushSubscriptions} device${status.pushSubscriptions !== 1 ? "s" : ""} registered`
              : undefined,
          },
          {
            icon: <Bell className="size-4" />,
            label: "Lead times",
            custom: status?.prefs?.lead_times_days?.length
              ? status.prefs.lead_times_days.map((d) => `${d}d`).join(", ")
              : "Not configured",
          },
        ].map(({ icon, label, value, sub, custom }, i, arr) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5",
              i < arr.length - 1 && "border-border/40 border-b"
            )}
          >
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            {custom !== undefined ? (
              <span className="text-muted-foreground text-sm tabular-nums">{custom}</span>
            ) : value === undefined ? (
              <span className="text-muted-foreground text-xs">—</span>
            ) : value ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                {sub ?? "Enabled"}
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <XCircle className="size-3.5" />
                Disabled
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Settings collapsible ── */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          className="hover:bg-muted/30 flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="text-muted-foreground size-3.5" />
            <span className="text-sm font-semibold">Notification settings</span>
          </div>
          {settingsOpen ? (
            <ChevronUp className="text-muted-foreground size-4" />
          ) : (
            <ChevronDown className="text-muted-foreground size-4" />
          )}
        </button>

        {settingsOpen && (
          <div className="border-t px-4 pt-3 pb-4">
            {settingsErr && (
              <Alert variant="destructive" className="mb-3">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{settingsErr}</AlertDescription>
              </Alert>
            )}
            {settingsMsg && (
              <Alert className="mb-3">
                <AlertDescription>{settingsMsg}</AlertDescription>
              </Alert>
            )}

            {/* Channels */}
            <div className="space-y-3">
              <div className="grid gap-1">
                <Label
                  htmlFor="lead-times"
                  className="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
                >
                  Lead times (days before renewal)
                </Label>
                <Input
                  id="lead-times"
                  value={leadTimesText}
                  onChange={(e) => setLeadTimesText(e.target.value)}
                  placeholder="7,3,1"
                  className="h-8 text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Comma-separated positive integers — e.g. 7,3,1
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Email reminders
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Push reminders (PWA)
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {pushReady && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pushWorking}
                    onClick={() => void enablePushOnDevice()}
                  >
                    {pushWorking && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                    Enable push on this device
                  </Button>
                )}
                <Button size="sm" disabled={saving} onClick={() => void handleSave()}>
                  {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                  Save settings
                </Button>
              </div>
            </div>

            {/* External destinations */}
            <div className="mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                External destinations
              </p>
              <p className="text-muted-foreground mb-3 text-xs">
                Slack, Discord, or webhook fan-out for reminders.
              </p>
              <DestinationForm onCreate={addDestination} />
              <div className="mt-3 space-y-2">
                {destinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">
                        {dest.name}{" "}
                        <span className="text-muted-foreground font-normal">({dest.channel})</span>
                        {!dest.is_enabled && (
                          <span className="text-muted-foreground font-normal"> · disabled</span>
                        )}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {dest.target_url ?? "No URL"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={!dest.is_enabled}
                        onClick={() => void sendDestinationTest(dest.id)}
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => void toggleDestination(dest.id, !dest.is_enabled)}
                      >
                        {dest.is_enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => void deleteDestination(dest.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {destinations.length === 0 && (
                  <p className="text-muted-foreground text-sm">No destinations configured.</p>
                )}
              </div>
            </div>

            {/* Google Calendar */}
            <div className="mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                Google Calendar
              </p>
              <p className="text-muted-foreground mb-3 text-xs">
                Sync active subscription renewals to your Google calendar.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => void connectGoogleCalendar()}>
                  Connect Google Calendar
                </Button>
                <Button variant="outline" size="sm" onClick={() => void triggerCalendarResync()}>
                  Re-sync events
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!status && !loading && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No status loaded.{" "}
          <button className="text-primary hover:underline" onClick={() => void loadStatus()}>
            Refresh
          </button>
        </p>
      )}
    </div>
  );
}
