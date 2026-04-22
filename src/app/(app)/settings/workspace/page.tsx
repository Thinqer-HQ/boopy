"use client";

import { useEffect, useState } from "react";

import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { SchemaNotReady } from "@/components/boopy/schema-not-ready";
import { WorkspaceSettingsDialog } from "@/components/boopy/workspace-settings-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrimaryWorkspace } from "@/hooks/use-primary-workspace";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function WorkspaceSettingsPage() {
  const { state } = usePrimaryWorkspace();
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    defaultCurrency: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (state.status !== "ready") return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`/api/workspace/settings?workspaceId=${state.workspaceId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        workspace?: { id: string; name: string; defaultCurrency: string };
      };
      if (!response.ok || !payload.workspace) {
        setError(payload.error ?? "Failed to load workspace settings.");
        return;
      }
      setError(null);
      setWorkspace(payload.workspace);
    }
    queueMicrotask(() => {
      void load();
    });
  }, [state]);

  async function saveWorkspaceSettings(input: { name: string; defaultCurrency: string }) {
    if (state.status !== "ready") return;
    const supabase = getSupabaseBrowser();
    if (!supabase || !workspace) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setSaving(true);
    const response = await fetch("/api/workspace/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        workspaceId: workspace.id,
        name: input.name,
        defaultCurrency: input.defaultCurrency,
      }),
    });
    setSaving(false);
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      workspace?: { id: string; name: string; defaultCurrency: string };
    };
    if (!response.ok || !payload.workspace) {
      setError(payload.error ?? "Failed to save workspace settings.");
      return;
    }
    setWorkspace(payload.workspace);
    setMessage("Workspace settings saved.");
    setError(null);
    setDialogOpen(false);
  }

  if (state.status === "not_configured") return <MissingSupabaseConfig />;
  if (state.status === "schema_not_ready") return <SchemaNotReady details={state.details} />;
  if (state.status !== "ready") {
    return <div className="text-muted-foreground p-8 text-sm">Loading workspace settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure workspace identity and default currency.
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
          <CardTitle>Defaults</CardTitle>
          <CardDescription>
            These defaults are used when creating new subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Workspace: <span className="font-medium">{workspace?.name ?? "-"}</span>
          </p>
          <p>
            Default currency:{" "}
            <span className="font-medium">{workspace?.defaultCurrency ?? "USD"}</span>
          </p>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Edit workspace settings
          </Button>
        </CardContent>
      </Card>

      {workspace ? (
        <WorkspaceSettingsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Edit workspace settings"
          description="Update name and default currency."
          initialName={workspace.name}
          initialCurrency={workspace.defaultCurrency}
          saving={saving}
          onSave={saveWorkspaceSettings}
        />
      ) : null}
    </div>
  );
}
