"use client";

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

export type WorkspaceState =
  | { status: "loading" }
  | { status: "not_configured" }
  | { status: "error"; message: string }
  | { status: "ready"; workspaceId: string }
  | { status: "empty" };

export function usePrimaryWorkspace() {
  const [state, setState] = useState<WorkspaceState>({ status: "loading" });

  const load = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) {
      setState({ status: "not_configured" });
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setState({ status: "not_configured" });
      return;
    }
    setState({ status: "loading" });
    const { data, error } = await supabase
      .from("workspaces")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      setState({ status: "error", message: error.message });
      return;
    }
    if (!data?.id) {
      setState({ status: "empty" });
      return;
    }
    setState({ status: "ready", workspaceId: data.id });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return { state, reload: load };
}
