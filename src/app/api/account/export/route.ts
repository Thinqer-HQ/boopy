import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

/**
 * GET /api/account/export
 * Returns a machine-readable JSON bundle of all personal data held for this user.
 * Satisfies GDPR Article 20 (Right to Data Portability) and Article 15 (Right of Access).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseService();

  // Resolve workspaces first, then fan out
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, created_at, updated_at")
    .eq("owner_user_id", user.id);

  const workspaceIds = (workspaces ?? []).map((w) => w.id);

  const [
    { data: billing },
    { data: groups },
    { data: calendarIntegrations },
    { data: driveIntegrations },
    { data: pushSubscriptions },
    { data: notificationDestinations },
  ] = await Promise.all([
    supabase
      .from("workspace_billing")
      .select("workspace_id, plan, status, created_at, updated_at")
      .in("workspace_id", workspaceIds),
    supabase
      .from("clients")
      .select("id, workspace_id, name, notes, created_at")
      .in("workspace_id", workspaceIds),
    supabase
      .from("calendar_integrations")
      .select("workspace_id, provider, created_at")
      .in("workspace_id", workspaceIds),
    supabase
      .from("drive_integrations")
      .select("workspace_id, root_folder_name, last_synced_at, enabled, created_at")
      .in("workspace_id", workspaceIds),
    supabase
      .from("push_subscriptions")
      .select("workspace_id, created_at")
      .in("workspace_id", workspaceIds),
    supabase
      .from("notification_destinations")
      .select("workspace_id, type, enabled, created_at")
      .in("workspace_id", workspaceIds),
  ]);

  const groupIds = (groups ?? []).map((g) => g.id);
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(
      "id, vendor_name, category, amount, currency, cadence, status, start_date, end_date, created_at, updated_at, client_id"
    )
    .in("client_id", groupIds.length > 0 ? groupIds : [""]);

  const bundle = {
    exportedAt: new Date().toISOString(),
    dataController: "Boopy",
    legalBasis: "Contract (GDPR Article 6(1)(b))",
    privacyContact: "privacy@boopy.app",
    user: {
      id: user.id,
      email: user.email,
    },
    workspaces: workspaces ?? [],
    billing: (billing ?? []).map((b) => ({
      workspaceId: b.workspace_id,
      plan: b.plan,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    })),
    groups: (groups ?? []).map((g) => ({
      id: g.id,
      workspaceId: g.workspace_id,
      name: g.name,
      notes: g.notes,
      createdAt: g.created_at,
    })),
    subscriptions: subscriptions ?? [],
    connectedIntegrations: {
      googleCalendar: (calendarIntegrations ?? []).map((c) => ({
        workspaceId: c.workspace_id,
        provider: c.provider,
        connectedAt: c.created_at,
      })),
      googleDrive: (driveIntegrations ?? []).map((d) => ({
        workspaceId: d.workspace_id,
        rootFolderName: d.root_folder_name,
        lastSyncedAt: d.last_synced_at,
        enabled: d.enabled,
        connectedAt: d.created_at,
      })),
    },
    notifications: {
      registeredDevices: (pushSubscriptions ?? []).length,
      destinations: (notificationDestinations ?? []).map((n) => ({
        workspaceId: n.workspace_id,
        type: n.type,
        enabled: n.enabled,
        createdAt: n.created_at,
      })),
    },
  };

  const filename = `boopy-data-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
