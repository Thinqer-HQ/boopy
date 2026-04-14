import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

export function supabaseService() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE env for server client");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
