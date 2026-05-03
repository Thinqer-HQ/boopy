import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

/**
 * Supabase client scoped to the caller's JWT. PostgREST uses `auth.uid()` for RLS.
 */
export function supabaseForUserAccessToken(accessToken: string) {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
