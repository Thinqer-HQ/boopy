import type { SupabaseClient } from "@supabase/supabase-js";

import type { ReportSubscription } from "@/lib/reports/transformers";

export async function fetchReportSubscriptions(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<{ data: ReportSubscription[]; error: string | null }> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, vendor_name, category, amount, currency, cadence, status, groups!inner(id, name, workspace_id)"
    )
    .eq("groups.workspace_id", workspaceId);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as ReportSubscription[], error: null };
}
