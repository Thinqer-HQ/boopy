import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

/**
 * Supabase client scoped to the caller's JWT. PostgREST uses `auth.uid()` for RLS.
 */
export function supabaseForUserAccessToken(accessToken: string) {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
