import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

type UpdateBody = {
  workspaceId?: string;
  name?: string;
  defaultCurrency?: string;
  markSetupComplete?: boolean;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getAuthorizedUserId(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  try {
    const user = await getUserOrThrow(token);
    return user.id;
  } catch {
    return null;
  }
}

async function getWorkspaceForOwner(userId: string, workspaceId?: string) {
  const supabase = supabaseService();
  const query = supabase
    .from("workspaces")
    .select("id, owner_user_id, name, default_currency, setup_completed_at")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (workspaceId) {
    return supabase
      .from("workspaces")
      .select("id, owner_user_id, name, default_currency, setup_completed_at")
      .eq("owner_user_id", userId)
      .eq("id", workspaceId)
      .maybeSingle();
  }
  return query.maybeSingle();
}

export async function GET(request: Request) {
  const userId = await getAuthorizedUserId(request);
  if (!userId) return unauthorized();
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();

  const { data: workspace, error } = await getWorkspaceForOwner(userId, workspaceId);
  if (error || !workspace) {
    return NextResponse.json({ error: error?.message ?? "Workspace not found." }, { status: 404 });
  }

  return NextResponse.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      defaultCurrency: workspace.default_currency ?? "USD",
      setupCompletedAt: workspace.setup_completed_at ?? null,
    },
  });
}

export async function PATCH(request: Request) {
  const userId = await getAuthorizedUserId(request);
  if (!userId) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as UpdateBody;
  const workspaceId = body.workspaceId?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

  const { data: workspace, error: workspaceError } = await getWorkspaceForOwner(
    userId,
    workspaceId
  );
  if (workspaceError || !workspace) {
    return NextResponse.json(
      { error: workspaceError?.message ?? "Workspace not found." },
      { status: 404 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.defaultCurrency === "string" && body.defaultCurrency.trim()) {
    updates.default_currency = body.defaultCurrency.trim().toUpperCase();
  }
  if (body.markSetupComplete) {
    updates.setup_completed_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const supabase = supabaseService();
  const { data, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", workspace.id)
    .eq("owner_user_id", userId)
    .select("id, name, default_currency, setup_completed_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Update failed." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    workspace: {
      id: data.id,
      name: data.name,
      defaultCurrency: data.default_currency,
      setupCompletedAt: data.setup_completed_at ?? null,
    },
  });
}
