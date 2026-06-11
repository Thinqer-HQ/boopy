"use client";

import { Calendar, HardDrive, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface GoogleIntegrationButtonsProps {
  /** "row" = flex-wrap row (subscriptions strip), "stack" = full-width column (quick actions) */
  layout?: "row" | "stack";
  className?: string;
}

export function GoogleIntegrationButtons({
  layout = "row",
  className,
}: GoogleIntegrationButtonsProps) {
  const { state } = usePrimaryWorkspace();
  const [calConnected, setCalConnected] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [calSyncing, setCalSyncing] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadStatus = useCallback(async () => {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const [calResult, driveRes] = await Promise.all([
      supabase
        .from("calendar_integrations")
        .select("provider")
        .eq("workspace_id", state.workspaceId)
        .eq("provider", "google")
        .limit(1),
      fetch(`/api/integrations/google-drive/status?workspaceId=${state.workspaceId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }),
    ]);

    setCalConnected(Boolean(calResult.data?.length));
    // Drive status loaded — just used to avoid errors; UI always shows connect button
    if (!driveRes.ok) {
      // non-fatal: leave driveConnected as false
    }
    setLoaded(true);
  }, [state]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function getToken(): Promise<string | null> {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function connectCalendar() {
    if (state.status !== "ready") return;
    const token = await getToken();
    if (!token) return;
    setCalLoading(true);
    const res = await fetch(
      `/api/integrations/google/start?workspaceId=${state.workspaceId}&redirectTo=/notifications`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const p = (await res.json().catch(() => ({}))) as { url?: string };
    if (p.url) {
      window.location.href = p.url;
    } else {
      setCalLoading(false);
    }
  }

  async function resyncCalendar() {
    if (state.status !== "ready") return;
    const token = await getToken();
    if (!token) return;
    setCalSyncing(true);
    await fetch("/api/integrations/google/resync", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ workspaceId: state.workspaceId, scope: "all" }),
    });
    setCalSyncing(false);
  }

  async function connectDrive() {
    if (state.status !== "ready") return;
    const token = await getToken();
    if (!token) return;
    setDriveLoading(true);
    const res = await fetch(
      `/api/integrations/google-drive/start?workspaceId=${state.workspaceId}&redirectTo=/notifications`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const p = (await res.json().catch(() => ({}))) as { url?: string };
    if (p.url) {
      window.location.href = p.url;
    } else {
      setDriveLoading(false);
    }
  }

  if (!loaded || state.status !== "ready") return null;

  const isStack = layout === "stack";

  return (
    <div
      className={cn(
        isStack ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2",
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={calLoading}
        onClick={() => void connectCalendar()}
        className={isStack ? "w-full justify-start gap-2.5" : "gap-2"}
      >
        {calLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span
            className={cn(
              isStack &&
                "bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md"
            )}
          >
            <Calendar className="size-3.5" />
          </span>
        )}
        Connect Google Calendar
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={calSyncing || !calConnected}
        onClick={() => void resyncCalendar()}
        className={isStack ? "w-full justify-start gap-2.5" : "gap-2"}
        title={!calConnected ? "Connect Google Calendar first" : undefined}
      >
        {calSyncing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span
            className={cn(
              isStack &&
                "bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md"
            )}
          >
            <RefreshCw className="size-3.5" />
          </span>
        )}
        Re-sync Events
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={driveLoading}
        onClick={() => void connectDrive()}
        className={isStack ? "w-full justify-start gap-2.5" : "gap-2"}
      >
        {driveLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span
            className={cn(
              isStack &&
                "bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md"
            )}
          >
            <HardDrive className="size-3.5" />
          </span>
        )}
        Connect Google Drive
      </Button>
    </div>
  );
}
