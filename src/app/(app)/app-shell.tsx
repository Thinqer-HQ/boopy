"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { AppHeader } from "@/components/boopy/app-header";
import { BoopyChatWidget } from "@/components/boopy/boopy-chat-widget";
import { BoopyRoadmapWidget } from "@/components/boopy/roadmap-widget";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { WorkspaceSettingsDialog } from "@/components/boopy/workspace-settings-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [missingSupabase] = useState(() => !isSupabaseBrowserConfigured());
  const [ready, setReady] = useState(false);
  const [settingsPatchError, setSettingsPatchError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [workspaceSettings, setWorkspaceSettings] = useState<{
    workspaceId: string;
    name: string;
    defaultCurrency: string;
    setupCompletedAt: string | null;
  } | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (missingSupabase) {
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return;
    }

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      if (!bootstrapped.current) {
        bootstrapped.current = true;
        const res = await fetch("/api/bootstrap", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          bootstrapped.current = false;
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }
      }

      const settingsResponse = await fetch("/api/workspace/settings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (settingsResponse.ok) {
        const settingsPayload = (await settingsResponse.json()) as {
          workspace?: {
            id: string;
            name: string;
            defaultCurrency: string;
            setupCompletedAt: string | null;
          };
        };
        if (settingsPayload.workspace) {
          setWorkspaceSettings({
            workspaceId: settingsPayload.workspace.id,
            name: settingsPayload.workspace.name,
            defaultCurrency: settingsPayload.workspace.defaultCurrency,
            setupCompletedAt: settingsPayload.workspace.setupCompletedAt,
          });
          if (!settingsPayload.workspace.setupCompletedAt) {
            setSettingsOpen(true);
          }
        }
      }
      setReady(true);
    })();
  }, [missingSupabase, router]);

  async function saveWorkspaceSettings(input: { name: string; defaultCurrency: string }) {
    const supabase = getSupabaseBrowser();
    if (!supabase || !workspaceSettings) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setSettingsSaving(true);
    setSettingsPatchError(null);
    const response = await fetch("/api/workspace/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        workspaceId: workspaceSettings.workspaceId,
        name: input.name,
        defaultCurrency: input.defaultCurrency,
        markSetupComplete: true,
      }),
    });
    setSettingsSaving(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setSettingsPatchError(payload.error ?? "Failed to save workspace settings.");
      return;
    }
    const payload = (await response.json()) as {
      workspace: {
        id: string;
        name: string;
        defaultCurrency: string;
        setupCompletedAt: string | null;
      };
    };
    setWorkspaceSettings({
      workspaceId: payload.workspace.id,
      name: payload.workspace.name,
      defaultCurrency: payload.workspace.defaultCurrency,
      setupCompletedAt: payload.workspace.setupCompletedAt,
    });
    setSettingsPatchError(null);
    setSettingsOpen(false);
  }

  if (missingSupabase) {
    return <MissingSupabaseConfig />;
  }

  if (!ready) {
    return (
      <div className="bg-muted/30 flex min-h-svh flex-1 flex-col">
        <div className="bg-background/80 border-b px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 max-w-full" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-svh flex-1 flex-col">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col pb-24 sm:pb-16">{children}</div>
      <div className="pointer-events-none fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(4.75rem,calc(3.5rem+env(safe-area-inset-bottom)))] z-40 flex flex-col items-end sm:right-5 sm:bottom-[max(5.25rem,calc(4rem+env(safe-area-inset-bottom)))] md:right-6 md:bottom-[max(5.5rem,calc(4.25rem+env(safe-area-inset-bottom)))]">
        <BoopyRoadmapWidget />
      </div>
      <BoopyChatWidget workspaceId={workspaceSettings?.workspaceId ?? null} />
      {workspaceSettings ? (
        <WorkspaceSettingsDialog
          open={settingsOpen}
          onOpenChange={(open) => {
            setSettingsOpen(open);
            if (!open) setSettingsPatchError(null);
          }}
          title="Welcome to Boopy - Set your workspace defaults"
          description="Set your workspace name and default currency first. You can change these anytime from the top-right quick settings button."
          initialName={workspaceSettings.name}
          initialCurrency={workspaceSettings.defaultCurrency}
          forceOpen={!workspaceSettings.setupCompletedAt}
          saving={settingsSaving}
          saveLabel="Save and continue"
          serverError={settingsPatchError}
          onSave={saveWorkspaceSettings}
        />
      ) : null}
    </div>
  );
}
