import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { tool } from "ai";
import { z } from "zod";

function jsonError(message: string) {
  return { ok: false as const, error: message };
}

function jsonOk<T extends Record<string, unknown>>(payload: T) {
  return { ok: true as const, ...payload };
}

async function primaryWorkspaceId(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, default_currency")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message, workspace: null as const };
  if (!data)
    return { error: "No workspace found. Complete onboarding first.", workspace: null as const };
  return { error: null, workspace: data };
}

export function createBoopyAssistantTools(supabase: SupabaseClient) {
  const getWorkspaceOverview = tool({
    description:
      "Boopy ONLY: read-only snapshot of the signed-in user's primary Boopy workspace — workspace id/name/default_currency, all groups in that workspace, and up to 40 subscriptions ordered by next renewal. No other product or data source. Use when answering anything about the user's current Boopy records or before creating a subscription if group ids are unknown.",
    parameters: z.object({}),
    execute: async () => {
      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      const [groupsRes, subsRes] = await Promise.all([
        supabase.from("groups").select("id, name").eq("workspace_id", workspace.id).order("name"),
        supabase
          .from("subscriptions")
          .select(
            "id, vendor_name, amount, currency, cadence, renewal_date, status, category, groups!inner(id, name, workspace_id)"
          )
          .eq("groups.workspace_id", workspace.id)
          .order("renewal_date", { ascending: true })
          .limit(40),
      ]);

      if (groupsRes.error) return jsonError(groupsRes.error.message);
      if (subsRes.error) return jsonError(subsRes.error.message);

      const rows = (subsRes.data ?? []) as Array<{
        id: string;
        vendor_name: string;
        amount: number | string;
        currency: string;
        cadence: string;
        renewal_date: string;
        status: string;
        category: string | null;
        groups: { id: string; name: string } | { id: string; name: string }[];
      }>;

      const subscriptions = rows.map((r) => {
        const g = Array.isArray(r.groups) ? r.groups[0] : r.groups;
        return {
          id: r.id,
          vendor_name: r.vendor_name,
          amount: r.amount,
          currency: r.currency,
          cadence: r.cadence,
          renewal_date: r.renewal_date,
          status: r.status,
          category: r.category,
          group_id: g?.id ?? null,
          group_name: g?.name ?? null,
        };
      });

      return jsonOk({
        workspace_id: workspace.id,
        workspace_name: workspace.name,
        default_currency: workspace.default_currency,
        groups: groupsRes.data ?? [],
        subscriptions,
      });
    },
  });

  const createGroup = tool({
    description:
      "Boopy ONLY: create one new empty subscription group (folder) in the user's primary Boopy workspace. Does nothing outside Boopy. Fails on duplicate group name for that workspace or Boopy plan limits.",
    parameters: z.object({
      name: z.string().min(1).max(120).describe("Display name for the group"),
      notes: z.string().max(2000).optional().describe("Optional notes"),
    }),
    execute: async ({ name, notes }) => {
      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      const { data, error: insErr } = await supabase
        .from("groups")
        .insert({ workspace_id: workspace.id, name: name.trim(), notes: notes?.trim() || null })
        .select("id, name")
        .single();

      if (insErr) return jsonError(insErr.message);
      return jsonOk({ group: data });
    },
  });

  const createSubscription = tool({
    description:
      "Boopy ONLY: insert one subscription row in Boopy (vendor, money fields, renewal date, cadence, status) under an existing group in the user's primary workspace. Does not touch billing providers or external services. Prefer group_id from get_workspace_overview; group_name resolves by case-insensitive match within that workspace.",
    parameters: z.object({
      group_id: z.string().uuid().optional().describe("Target group id"),
      group_name: z.string().min(1).max(120).optional().describe("Target group name if id unknown"),
      vendor_name: z.string().min(1).max(200),
      amount: z.number().nonnegative(),
      currency: z
        .string()
        .min(3)
        .max(8)
        .transform((s) => s.trim().toUpperCase()),
      cadence: z.enum(["monthly", "yearly", "custom"]),
      renewal_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("ISO date YYYY-MM-DD"),
      status: z.enum(["active", "paused", "cancelled"]).optional().default("active"),
      category: z.string().max(120).optional(),
      notes: z.string().max(2000).optional(),
    }),
    execute: async (args) => {
      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      let groupId = args.group_id ?? null;
      if (!groupId && args.group_name) {
        const { data: g, error: gErr } = await supabase
          .from("groups")
          .select("id, name")
          .eq("workspace_id", workspace.id)
          .ilike("name", args.group_name.trim())
          .maybeSingle();
        if (gErr) return jsonError(gErr.message);
        if (!g) return jsonError(`No group named "${args.group_name}" in this workspace.`);
        groupId = g.id;
      }
      if (!groupId) return jsonError("Provide group_id or group_name.");

      const { data, error: insErr } = await supabase
        .from("subscriptions")
        .insert({
          group_id: groupId,
          vendor_name: args.vendor_name.trim(),
          amount: args.amount,
          currency: args.currency,
          cadence: args.cadence,
          renewal_date: args.renewal_date,
          status: args.status ?? "active",
          category: args.category?.trim() || null,
          notes: args.notes?.trim() || null,
        })
        .select("id, vendor_name, renewal_date, group_id")
        .single();

      if (insErr) return jsonError(insErr.message);
      return jsonOk({ subscription: data });
    },
  });

  return { getWorkspaceOverview, createGroup, createSubscription };
}
