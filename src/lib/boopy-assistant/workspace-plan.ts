import "server-only";

import { resolvePlan, type WorkspacePlan } from "@/lib/billing/plan";
import { supabaseForUserAccessToken } from "@/lib/supabase/user-access";

export type PrimaryWorkspacePlanResult =
  | { ok: true; workspaceId: string; plan: WorkspacePlan }
  | { ok: false; status: number; message: string };

/**
 * Primary workspace (oldest by `created_at`) and its billing plan, using the caller's JWT (RLS).
 */
export async function getPrimaryWorkspacePlanForToken(
  accessToken: string
): Promise<PrimaryWorkspacePlanResult> {
  const supabase = supabaseForUserAccessToken(accessToken);

  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (wsErr) {
    return { ok: false, status: 500, message: wsErr.message };
  }
  if (!ws?.id) {
    return { ok: false, status: 403, message: "No workspace found for this account." };
  }

  const { data: bill, error: billErr } = await supabase
    .from("workspace_billing")
    .select("plan")
    .eq("workspace_id", ws.id)
    .maybeSingle();

  if (billErr) {
    const missingTable =
      billErr.message.includes("Could not find the table") ||
      (billErr.message.includes("workspace_billing") && billErr.message.includes("schema cache"));
    if (!missingTable) {
      return { ok: false, status: 500, message: billErr.message };
    }
  }

  return { ok: true, workspaceId: ws.id, plan: resolvePlan(bill?.plan) };
}
