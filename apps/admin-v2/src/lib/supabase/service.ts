import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

let cached: ReturnType<typeof createClient> | null = null;

/** Bypasses RLS. Only call from Route Handlers, only for the specific writes that need it. */
export function supabaseService() {
  if (!cached) {
    const env = getEnv();
    cached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
