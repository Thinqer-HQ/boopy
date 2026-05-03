/**
 * Origin used in Supabase `emailRedirectTo` / OAuth redirects (no trailing slash).
 * Set `NEXT_PUBLIC_APP_URL` in each deploy (e.g. https://useboopy.com) so confirmation
 * emails point at production, not localhost.
 */
export function getPublicAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}
