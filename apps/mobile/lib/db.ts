import * as SQLite from "expo-sqlite";
import type { Group, Subscription, AppSettings, NewSubscription } from "./types";

export function initDB(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      group_id TEXT,
      vendor_name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      cadence TEXT DEFAULT 'monthly',
      renewal_date TEXT,
      status TEXT DEFAULT 'active',
      category TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO groups (id, name) VALUES ('default', 'Personal');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('default_currency', 'USD');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('notifications_enabled', 'true');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('user_id', NULL);
    INSERT OR IGNORE INTO settings (key, value) VALUES ('last_synced', NULL);
  `);
}

// ── Groups ──────────────────────────────────────────────────────────────────

export function getGroups(db: SQLite.SQLiteDatabase): Group[] {
  return db.getAllSync<Group>("SELECT * FROM groups WHERE deleted = 0 ORDER BY name ASC");
}

export function createGroup(db: SQLite.SQLiteDatabase, name: string): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.runSync(
    "INSERT INTO groups (id, name, created_at, updated_at, synced, deleted) VALUES (?, ?, ?, ?, 0, 0)",
    [id, name, now, now]
  );
  return id;
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export function getAllSubscriptions(db: SQLite.SQLiteDatabase): Subscription[] {
  return db.getAllSync<Subscription>(
    "SELECT * FROM subscriptions WHERE deleted = 0 ORDER BY renewal_date ASC, vendor_name ASC"
  );
}

export function getActiveSubscriptions(db: SQLite.SQLiteDatabase): Subscription[] {
  return db.getAllSync<Subscription>(
    "SELECT * FROM subscriptions WHERE status = 'active' AND deleted = 0 ORDER BY renewal_date ASC"
  );
}

export function getSubscriptionById(db: SQLite.SQLiteDatabase, id: string): Subscription | null {
  return db.getFirstSync<Subscription>("SELECT * FROM subscriptions WHERE id = ?", [id]) ?? null;
}

export function createSubscription(db: SQLite.SQLiteDatabase, data: NewSubscription): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO subscriptions
       (id, group_id, vendor_name, amount, currency, cadence, renewal_date, status, category, notes, created_at, updated_at, synced, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      id,
      data.group_id ?? "default",
      data.vendor_name,
      data.amount,
      data.currency,
      data.cadence,
      data.renewal_date ?? null,
      data.status ?? "active",
      data.category ?? null,
      data.notes ?? null,
      now,
      now,
    ]
  );
  return id;
}

export function updateSubscription(
  db: SQLite.SQLiteDatabase,
  id: string,
  data: Partial<NewSubscription>
) {
  const now = new Date().toISOString();
  const allowed = [
    "group_id",
    "vendor_name",
    "amount",
    "currency",
    "cadence",
    "renewal_date",
    "status",
    "category",
    "notes",
  ];
  const keys = Object.keys(data).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const vals = keys.map((k) => (data as Record<string, unknown>)[k]);
  db.runSync(`UPDATE subscriptions SET ${sets}, updated_at = ?, synced = 0 WHERE id = ?`, [
    ...vals,
    now,
    id,
  ]);
}

export function softDeleteSubscription(db: SQLite.SQLiteDatabase, id: string) {
  db.runSync(
    "UPDATE subscriptions SET deleted = 1, updated_at = datetime('now'), synced = 0 WHERE id = ?",
    [id]
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function getSetting(db: SQLite.SQLiteDatabase, key: keyof AppSettings): string | null {
  const row = db.getFirstSync<{ value: string | null }>(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  );
  return row?.value ?? null;
}

export function setSetting(
  db: SQLite.SQLiteDatabase,
  key: keyof AppSettings,
  value: string | null
) {
  db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
}

export function getAllSettings(db: SQLite.SQLiteDatabase): AppSettings {
  const rows = db.getAllSync<{ key: string; value: string | null }>(
    "SELECT key, value FROM settings"
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    default_currency: map["default_currency"] ?? "USD",
    notifications_enabled: map["notifications_enabled"] ?? "true",
    user_id: map["user_id"] ?? null,
    last_synced: map["last_synced"] ?? null,
  };
}

// ── Unsynced records ─────────────────────────────────────────────────────────

export function getUnsyncedSubscriptions(db: SQLite.SQLiteDatabase): Subscription[] {
  return db.getAllSync<Subscription>("SELECT * FROM subscriptions WHERE synced = 0");
}

export function markSynced(
  db: SQLite.SQLiteDatabase,
  table: "subscriptions" | "groups",
  id: string
) {
  db.runSync(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
}

export function upsertFromCloud(db: SQLite.SQLiteDatabase, sub: Subscription) {
  db.runSync(
    `INSERT OR REPLACE INTO subscriptions
       (id, group_id, vendor_name, amount, currency, cadence, renewal_date, status, category, notes, created_at, updated_at, synced, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      sub.id,
      sub.group_id,
      sub.vendor_name,
      sub.amount,
      sub.currency,
      sub.cadence,
      sub.renewal_date,
      sub.status,
      sub.category,
      sub.notes,
      sub.created_at,
      sub.updated_at,
      sub.deleted ?? 0,
    ]
  );
}
