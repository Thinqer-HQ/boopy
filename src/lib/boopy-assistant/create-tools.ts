import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonSchema, tool } from "ai";

function jsonError(message: string) {
  return { ok: false as const, error: message };
}

function jsonOk<T extends Record<string, unknown>>(payload: T) {
  return { ok: true as const, ...payload };
}

async function primaryWorkspaceId(supabase: SupabaseClient): Promise<
  | { error: string; workspace: null }
  | {
      error: null;
      workspace: { id: string; name: string; default_currency: string | null };
    }
> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, default_currency")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message, workspace: null };
  if (!data) {
    return { error: "No workspace found. Complete onboarding first.", workspace: null };
  }
  return { error: null, workspace: data };
}

export function createBoopyAssistantTools(supabase: SupabaseClient) {
  const getWorkspaceOverview = tool({
    description:
      "Boopy ONLY: read-only snapshot of the signed-in user's primary Boopy workspace — workspace id/name/default_currency, all groups in that workspace, and up to 40 subscriptions ordered by next renewal. No other product or data source. Use when answering anything about the user's current Boopy records or before creating a subscription if group ids are unknown.",
    parameters: jsonSchema<Record<string, never>>({
      type: "object",
      properties: {},
    }),
    execute: async () => {
      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      const [groupsRes, subsRes] = await Promise.all([
        supabase.from("groups").select("id, name").eq("workspace_id", workspace.id).order("name"),
        supabase
          .from("subscriptions")
          .select(
            "id, vendor_name, amount, currency, cadence, renewal_date, start_date, end_date, status, category, groups!inner(id, name, workspace_id)"
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
        start_date: string | null;
        end_date: string | null;
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
          start_date: r.start_date,
          end_date: r.end_date,
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
    parameters: jsonSchema<{ name: string; notes?: string }>({
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          description: "Display name for the group",
        },
        notes: { type: "string", maxLength: 2000, description: "Optional notes" },
      },
      required: ["name"],
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
    parameters: jsonSchema<{
      group_id?: string;
      group_name?: string;
      vendor_name: string;
      amount: number;
      currency: string;
      cadence: "monthly" | "yearly" | "quarterly" | "custom";
      renewal_date: string;
      start_date?: string;
      end_date?: string;
      status?: "active" | "paused" | "cancelled";
      category?: string;
      notes?: string;
    }>({
      type: "object",
      properties: {
        group_id: { type: "string", description: "Target group id" },
        group_name: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          description: "Target group name if id unknown",
        },
        vendor_name: { type: "string", minLength: 1, maxLength: 200 },
        amount: { type: "number", minimum: 0 },
        currency: {
          type: "string",
          minLength: 3,
          maxLength: 8,
          description: "ISO 4217 currency code, e.g. USD",
        },
        cadence: { type: "string", enum: ["monthly", "yearly", "quarterly", "custom"] },
        renewal_date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "ISO date YYYY-MM-DD",
        },
        start_date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Optional subscription start YYYY-MM-DD",
        },
        end_date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Optional last billing day YYYY-MM-DD",
        },
        status: { type: "string", enum: ["active", "paused", "cancelled"] },
        category: { type: "string", maxLength: 120 },
        notes: { type: "string", maxLength: 2000 },
      },
      required: ["vendor_name", "amount", "currency", "cadence", "renewal_date"],
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
      const start = args.start_date?.trim();
      const end = args.end_date?.trim();
      if (start && end && end < start) {
        return jsonError("end_date must be on or after start_date.");
      }

      const { data, error: insErr } = await supabase
        .from("subscriptions")
        .insert({
          group_id: groupId,
          vendor_name: args.vendor_name.trim(),
          amount: args.amount,
          currency: args.currency.trim().toUpperCase(),
          cadence: args.cadence,
          renewal_date: args.renewal_date,
          start_date: start || null,
          end_date: end || null,
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

  const updateSubscription = tool({
    description:
      "Boopy ONLY: update one or more fields on an existing subscription in the user's primary workspace. Only supply fields you want to change. Use get_workspace_overview to find the subscription id first.",
    parameters: jsonSchema<{
      subscription_id: string;
      vendor_name?: string;
      amount?: number;
      currency?: string;
      cadence?: "monthly" | "yearly" | "quarterly" | "custom";
      renewal_date?: string;
      start_date?: string;
      end_date?: string;
      status?: "active" | "paused" | "cancelled";
      category?: string;
      notes?: string;
    }>({
      type: "object",
      properties: {
        subscription_id: { type: "string", description: "ID of the subscription to update" },
        vendor_name: { type: "string", minLength: 1, maxLength: 200 },
        amount: { type: "number", minimum: 0 },
        currency: { type: "string", minLength: 3, maxLength: 8 },
        cadence: { type: "string", enum: ["monthly", "yearly", "quarterly", "custom"] },
        renewal_date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "ISO date YYYY-MM-DD",
        },
        start_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        end_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        status: { type: "string", enum: ["active", "paused", "cancelled"] },
        category: { type: "string", maxLength: 120 },
        notes: { type: "string", maxLength: 2000 },
      },
      required: ["subscription_id"],
    }),
    execute: async ({ subscription_id, ...fields }) => {
      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) {
          if (k === "currency" && typeof v === "string") {
            patch[k] = v.trim().toUpperCase() || null;
          } else {
            patch[k] = typeof v === "string" ? v.trim() || null : v;
          }
        }
      }
      if (Object.keys(patch).length === 0) {
        return jsonError("No fields to update — supply at least one field to change.");
      }

      const { data, error: upErr } = await supabase
        .from("subscriptions")
        .update(patch)
        .eq("id", subscription_id)
        .select("id, vendor_name, renewal_date, status, group_id")
        .maybeSingle();

      if (upErr) return jsonError(upErr.message);
      if (!data) return jsonError("Subscription not found or you don't have access to it.");
      return jsonOk({ updated: data });
    },
  });

  const deleteSubscription = tool({
    description:
      "Boopy ONLY: permanently delete a subscription from the user's primary workspace. This is irreversible. Always confirm with the user before calling this tool.",
    parameters: jsonSchema<{ subscription_id: string; confirmed: boolean }>({
      type: "object",
      properties: {
        subscription_id: { type: "string", description: "ID of the subscription to delete" },
        confirmed: {
          type: "boolean",
          description:
            "Must be true — the user explicitly confirmed they want to delete this subscription",
        },
      },
      required: ["subscription_id", "confirmed"],
    }),
    execute: async ({ subscription_id, confirmed }) => {
      if (!confirmed) {
        return jsonError("User did not confirm deletion. Ask them to confirm before proceeding.");
      }

      const { error, workspace } = await primaryWorkspaceId(supabase);
      if (error || !workspace) return jsonError(error ?? "Workspace missing");

      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, vendor_name")
        .eq("id", subscription_id)
        .maybeSingle();

      if (!existing) return jsonError("Subscription not found or already deleted.");

      const { error: delErr } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscription_id);

      if (delErr) return jsonError(delErr.message);
      return jsonOk({ deleted: { id: subscription_id, vendor_name: existing.vendor_name } });
    },
  });

  return {
    getWorkspaceOverview,
    createGroup,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  };
}
