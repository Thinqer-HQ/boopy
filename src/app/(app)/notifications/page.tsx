"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type NotificationStatus = {
  prefs: { email_enabled: boolean; push_enabled: boolean; lead_times_days: number[] } | null;
  jobs: { pending: number; sent: number; failed: number; total: number };
  destinations: { total: number; enabled: number };
  pushSubscriptions: number;
};

export default function NotificationsPage() {
  const { state } = usePrimaryWorkspace();
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
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
    setLoading(true);
    const response = await fetch(`/api/notifications/status?workspaceId=${state.workspaceId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      prefs?: NotificationStatus["prefs"];
      jobs?: NotificationStatus["jobs"];
      destinations?: NotificationStatus["destinations"];
      pushSubscriptions?: number;
    };
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Failed to load notification status.");
      return;
    }
    setError(null);
    setStatus({
      prefs: payload.prefs ?? null,
      jobs: payload.jobs ?? { pending: 0, sent: 0, failed: 0, total: 0 },
      destinations: payload.destinations ?? { total: 0, enabled: 0 },
      pushSubscriptions: payload.pushSubscriptions ?? 0,
    });
  }, [state]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatus();
    });
  }, [loadStatus]);

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading notifications…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Health and delivery status for reminders across channels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading} onClick={() => void loadStatus()}>
            {loading ? "Refreshing..." : "Refresh status"}
          </Button>
          <Link
            href="/settings/notifications"
            className={cn(buttonVariants({ variant: "default" }), "inline-flex")}
          >
            Open advanced settings
          </Link>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Notification status error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{status?.jobs.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{status?.jobs.failed ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Enabled destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">
              {status?.destinations.enabled ?? 0}/{status?.destinations.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Push subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{status?.pushSubscriptions ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Email reminders: {status?.prefs?.email_enabled ? "Enabled" : "Disabled"}</p>
          <p>Push reminders: {status?.prefs?.push_enabled ? "Enabled" : "Disabled"}</p>
          <p>
            Lead times:{" "}
            {status?.prefs?.lead_times_days?.length
              ? status.prefs.lead_times_days.join(", ")
              : "Not configured"}
          </p>
          <p>Total jobs recorded: {status?.jobs.total ?? 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}
