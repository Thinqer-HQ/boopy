"use client";

import { useCallback, useEffect, useState } from "react";

import { resolvePlan, type WorkspacePlan } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type WorkspaceBillingState = {
  loading: boolean;
  plan: WorkspacePlan;
  status: string;
  error: string | null;
};

export function useWorkspaceBilling(workspaceId: string | null | undefined) {
  const [state, setState] = useState<WorkspaceBillingState>({
    loading: true,
    plan: "free",
    status: "free",
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!workspaceId) {
      setState({ loading: false, plan: "free", status: "free", error: null });
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setState({ loading: false, plan: "free", status: "free", error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase
      .from("workspace_billing")
      .select("plan, status")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) {
      const missingTable =
        error.message.includes("Could not find the table 'public.workspace_billing'") ||
        (error.message.includes("workspace_billing") && error.message.includes("schema cache"));
      if (missingTable) {
        setState({ loading: false, plan: "free", status: "free", error: null });
        return;
      }
      setState({ loading: false, plan: "free", status: "free", error: error.message });
      return;
    }

    setState({
      loading: false,
      plan: resolvePlan(data?.plan),
      status: data?.status ?? "free",
      error: null,
    });
  }, [workspaceId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refetch();
    });
  }, [refetch]);

  return { ...state, refetch };
}
