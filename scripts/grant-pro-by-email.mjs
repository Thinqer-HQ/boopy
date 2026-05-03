/**
 * One-off: grant Pro plan for all workspaces owned by a Supabase Auth user email.
 * Usage: node scripts/grant-pro-by-email.mjs user@example.com
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment or .env (Node --env-file).
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  if (!existsSync(".env")) return;
  const raw = readFileSync(".env", "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/grant-pro-by-email.mjs user@example.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

let userId = null;
let page = 1;
const perPage = 200;
while (!userId) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error) {
    console.error("listUsers:", error.message);
    process.exit(1);
  }
  const found = data.users.find((u) => u.email?.toLowerCase() === email);
  if (found) {
    userId = found.id;
    break;
  }
  if (data.users.length < perPage) break;
  page += 1;
}

if (!userId) {
  console.error(`No auth user found with email: ${email}`);
  process.exit(1);
}

const { data: workspaces, error: wsErr } = await supabase
  .from("workspaces")
  .select("id")
  .eq("owner_user_id", userId);

if (wsErr) {
  console.error("workspaces:", wsErr.message);
  process.exit(1);
}

if (!workspaces?.length) {
  console.error(`User ${email} has no workspaces (owner_user_id=${userId})`);
  process.exit(1);
}

for (const w of workspaces) {
  const { error } = await supabase.from("workspace_billing").upsert(
    {
      workspace_id: w.id,
      plan: "pro",
      status: "active",
    },
    { onConflict: "workspace_id" }
  );
  if (error) {
    console.error(`upsert workspace ${w.id}:`, error.message);
    process.exit(1);
  }
}

console.log(`OK: Pro granted for ${email} (${workspaces.length} workspace(s)).`);
