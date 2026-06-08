"use client";

import { Bell, CheckCircle2, Mail, RefreshCw, Settings, Smartphone, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void loadStatus()}>
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Link
            href="/settings/notifications"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <Settings className="size-3.5" />
            Settings
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
