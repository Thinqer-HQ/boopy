import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/** True when browser Supabase can be used (public env present). */
export function isSupabaseBrowserConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.trim() && anonKey?.trim());
}

/**
 * Browser Supabase client. Returns `null` if public env is missing so the app
 * can render a setup screen instead of throwing during `npm run dev`.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}

/**
 * @throws if public Supabase env is missing — use only after you've verified config.
 */
export function supabaseBrowser(): SupabaseClient {
  const client = getSupabaseBrowser();
  if (!client) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return client;
}
