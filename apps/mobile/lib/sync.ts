import type { SQLiteDatabase } from "expo-sqlite";
import { supabase } from "./supabase";
import {
  getAllSubscriptions,
  getUnsyncedSubscriptions,
  upsertFromCloud,
  markSynced,
  setSetting,
} from "./db";
import type { Subscription } from "./types";

export type SyncResult = {
  pushed: number;
  pulled: number;
  error?: string;
};

export async function syncToCloud(db: SQLiteDatabase, workspaceId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0 };

  try {
    // 1. Push local unsynced changes
    const unsynced = getUnsyncedSubscriptions(db);
    for (const sub of unsynced) {
      if (sub.deleted) {
        await supabase.from("subscriptions").delete().eq("id", sub.id);
      } else {
        await supabase.from("subscriptions").upsert({
          id: sub.id,
          vendor_name: sub.vendor_name,
          amount: sub.amount,
          currency: sub.currency,
          cadence: sub.cadence,
          renewal_date: sub.renewal_date,
          status: sub.status,
          category: sub.category,
          notes: sub.notes,
          created_at: sub.created_at,
          updated_at: sub.updated_at,
        });
      }
      markSynced(db, "subscriptions", sub.id);
      result.pushed++;
    }

    // 2. Pull cloud subscriptions (via groups join)
    const { data: groups } = await supabase
      .from("groups")
      .select(
        "id, subscriptions(id, vendor_name, amount, currency, cadence, renewal_date, status, category, notes, created_at, updated_at)"
      )
      .eq("workspace_id", workspaceId);

    const cloudSubs: Subscription[] = (groups ?? []).flatMap((g) => {
      const subs = Array.isArray(g.subscriptions) ? g.subscriptions : [];
      return subs.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        group_id: g.id,
        vendor_name: s.vendor_name as string,
        amount: Number(s.amount) || 0,
        currency: (s.currency as string) ?? "USD",
        cadence: (s.cadence as Subscription["cadence"]) ?? "monthly",
        renewal_date: (s.renewal_date as string) ?? null,
        status: (s.status as Subscription["status"]) ?? "active",
        category: (s.category as string) ?? null,
        notes: (s.notes as string) ?? null,
        created_at: s.created_at as string,
        updated_at: s.updated_at as string,
        synced: 1,
        deleted: 0,
      }));
    });

    // Upsert cloud subs into local DB (cloud wins for conflicts)
    for (const sub of cloudSubs) {
      const local = getAllSubscriptions(db).find((s) => s.id === sub.id);
      // Only overwrite if cloud version is newer
      if (!local || new Date(sub.updated_at) >= new Date(local.updated_at)) {
        upsertFromCloud(db, sub);
        result.pulled++;
      }
    }

    setSetting(db, "last_synced", new Date().toISOString());
  } catch (e) {
    result.error = e instanceof Error ? e.message : "Sync failed";
  }

  return result;
}
