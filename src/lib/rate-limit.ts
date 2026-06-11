type RateLimitEntry = { count: number; resetAt: number };
const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (val.resetAt <= now) store.delete(key);
  }
}, 5 * 60_000);

export function rateLimit(params: { key: string; limit: number; windowMs: number }): {
  ok: boolean;
  retryAfter: number;
  remaining: number;
} {
  const now = Date.now();
  const entry = store.get(params.key);

  if (!entry || entry.resetAt <= now) {
    store.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return { ok: true, retryAfter: 0, remaining: params.limit - 1 };
  }

  if (entry.count >= params.limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  entry.count++;
  return { ok: true, retryAfter: 0, remaining: params.limit - entry.count };
}

export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
