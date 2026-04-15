"use client";

import { useEffect, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

function parseLeadTimes(raw: string): number[] {
  return [...new Set(raw.split(",").map((token) => Number.parseInt(token.trim(), 10)))]
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => b - a);
}

export default function NotificationSettingsPage() {
  const { state, reload } = usePrimaryWorkspace();
  const [leadTimesText, setLeadTimesText] = useState("7,3,1");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

          <Button disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Need higher limits? Manage your plan in <Link href="/settings/billing">billing</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
