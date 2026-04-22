"use client";

import { useEffect, useState } from "react";

import { DestinationForm } from "@/components/boopy/notifications/destination-form";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { base64UrlToUint8Array, isValidVapidPublicKey } from "@/lib/notifications/vapid";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

function parseLeadTimes(raw: string): number[] {
  return [...new Set(raw.split(",").map((token) => Number.parseInt(token.trim(), 10)))]
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => b - a);
}

export default function NotificationSettingsPage() {
  const searchParams = useSearchParams();
  const { state, reload } = usePrimaryWorkspace();
  const [leadTimesText, setLeadTimesText] = useState("7,3,1");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushReady, setPushReady] = useState(false);
  const [pushWorking, setPushWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    const calendar = searchParams.get("calendar");
    if (calendar === "connected") {
      setMessage("Google Calendar connected.");
      setError(null);
    } else if (calendar === "error") {
      setError("Google Calendar connection failed. Please try again.");
    }
  }, [searchParams]);

  async function refreshDestinations(workspaceId: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data: destinationRows, error: destinationError } = await supabase
      .from("notification_destinations")
      .select("id, channel, name, target_url, is_enabled")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (destinationError) {
      setError(destinationError.message);
      return;
    }
    setDestinations(
      (destinationRows ?? []) as Array<{
        id: string;
        channel: "slack" | "discord" | "webhook";
        name: string;
        target_url: string | null;
        is_enabled: boolean;
      }>
    );
  }

  useEffect(() => {
    async function loadSettings() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data, error: loadError } = await supabase
        .from("notification_prefs")
        .select("lead_times_days, email_enabled, push_enabled")
        .eq("workspace_id", state.workspaceId)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        return;
      }

      if (data) {
        setLeadTimesText((data.lead_times_days ?? [7, 3, 1]).join(","));
        setEmailEnabled(Boolean(data.email_enabled));
        setPushEnabled(Boolean(data.push_enabled));
      }
      await refreshDestinations(state.workspaceId);
    }

    queueMicrotask(() => {
      void loadSettings();
    });
  }, [state]);

  async function handleSave() {
    if (state.status !== "ready") return;
    const leadTimes = parseLeadTimes(leadTimesText);
    if (leadTimes.length === 0) {
      setError("Lead times must include at least one positive day (e.g. 7,3,1).");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

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
      setError(saveError.message);
      return;
    }

    setLeadTimesText(leadTimes.join(","));
    setMessage("Notification settings saved.");
  }

  async function enablePushOnDevice() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey || !isValidVapidPublicKey(vapidPublicKey)) {
      setError(
        "Push configuration is invalid. Ask admin to set a valid NEXT_PUBLIC_VAPID_PUBLIC_KEY."
      );
      return;
    }
    const validVapidPublicKey = vapidPublicKey.trim();
    if (!pushReady) {
      setError("Push is not supported in this browser.");
      return;
    }

    setPushWorking(true);
    setError(null);
    setMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("You are not signed in.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(validVapidPublicKey),
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
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed to save push subscription.");
      }

      setMessage("Push notifications enabled on this device.");
    } catch (pushError) {
      if (
        pushError instanceof DOMException &&
        pushError.message.includes("applicationServerKey is not valid")
      ) {
        setError(
          "Push configuration is invalid on this deployment. Please refresh after VAPID keys are updated."
        );
        return;
      }
      setError(
        pushError instanceof Error ? pushError.message : "Failed to enable push notifications."
      );
    } finally {
      setPushWorking(false);
    }
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
    const { error: insertError } = await supabase.from("notification_destinations").insert({
      workspace_id: state.workspaceId,
      channel: payload.channel,
      name: payload.name,
      target_url: payload.targetUrl,
      secret_header: payload.secretHeader ?? null,
      is_enabled: true,
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setMessage("Destination added.");
    await refreshDestinations(state.workspaceId);
  }

  async function toggleDestination(destinationId: string, nextEnabled: boolean) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(null);
    const { error: updateError } = await supabase
      .from("notification_destinations")
      .update({ is_enabled: nextEnabled })
      .eq("id", destinationId)
      .eq("workspace_id", state.workspaceId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage(nextEnabled ? "Destination enabled." : "Destination disabled.");
    await refreshDestinations(state.workspaceId);
  }

  async function deleteDestination(destinationId: string) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(null);
    const { error: deleteError } = await supabase
      .from("notification_destinations")
      .delete()
      .eq("id", destinationId)
      .eq("workspace_id", state.workspaceId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setMessage("Destination removed.");
    await refreshDestinations(state.workspaceId);
  }

  async function sendDestinationTest(destinationId: string) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }
    const response = await fetch("/api/notifications/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId: state.workspaceId, destinationId }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Send-test failed.");
      return;
    }
    setMessage("Send-test succeeded.");
  }

  async function connectGoogleCalendar() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }
    const response = await fetch(
      `/api/integrations/google/start?workspaceId=${state.workspaceId}`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
    );
    const payload = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!response.ok || !payload.url) {
      setError(payload.error ?? "Failed to start Google connect.");
      return;
    }
    window.location.href = payload.url;
  }

  async function triggerCalendarResync() {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("You are not signed in.");
      return;
    }
    const response = await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ workspaceId: state.workspaceId }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Calendar re-sync failed.");
      return;
    }
    setMessage("Calendar re-sync started.");
  }

  if (state.status === "not_configured") {
    return <MissingSupabaseConfig />;
  }

  if (state.status === "loading") {
    return <div className="text-muted-foreground p-8 text-sm">Loading settings…</div>;
  }

  if (state.status === "error") {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load workspace</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (state.status === "schema_not_ready") {
    return <SchemaNotReady details={state.details} />;
  }

  if (state.status === "empty") {
    return (
      <div className="p-8">
        <Alert>
          <AlertTitle>No workspace yet</AlertTitle>
          <AlertDescription>
            Open dashboard once while signed in so Boopy can create your personal workspace.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Notification settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Boopy uses these lead times when generating reminder jobs.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Reminder channels</CardTitle>
          <CardDescription>Choose when and how reminders are sent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="lead-times">Lead times (days)</Label>
            <Input
              id="lead-times"
              value={leadTimesText}
              onChange={(event) => setLeadTimesText(event.target.value)}
              placeholder="7,3,1"
            />
            <p className="text-muted-foreground text-xs">Comma-separated positive integers.</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(event) => setEmailEnabled(event.target.checked)}
            />
            Email reminders
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(event) => setPushEnabled(event.target.checked)}
            />
            Push reminders (PWA)
          </label>

          <Button
            variant="outline"
            disabled={pushWorking || !pushReady}
            onClick={() => void enablePushOnDevice()}
          >
            {pushWorking ? "Enabling push…" : "Enable push on this device"}
          </Button>
          {!pushReady ? (
            <p className="text-muted-foreground text-xs">
              Push is unavailable in this browser/session. Use a supported browser with service
              workers.
            </p>
          ) : null}

          <Button disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Need higher limits? Manage your plan in <Link href="/settings/billing">billing</Link>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External destinations</CardTitle>
          <CardDescription>
            Add Slack, Discord, or generic webhook destinations for reminder fan-out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DestinationForm onCreate={addDestination} />
          <div className="space-y-2">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {destination.name} ({destination.channel}){" "}
                    {!destination.is_enabled ? (
                      <span className="text-muted-foreground font-normal">(disabled)</span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground text-xs break-all">
                    {destination.target_url ?? "No URL configured"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!destination.is_enabled}
                    onClick={() => void sendDestinationTest(destination.id)}
                  >
                    Send test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void toggleDestination(destination.id, !destination.is_enabled)}
                  >
                    {destination.is_enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void deleteDestination(destination.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {destinations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No external destinations configured.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>
            Sync active subscription renewals to your Google calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void connectGoogleCalendar()}>
            Connect Google Calendar
          </Button>
          <Button variant="outline" onClick={() => void triggerCalendarResync()}>
            Re-sync events
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
