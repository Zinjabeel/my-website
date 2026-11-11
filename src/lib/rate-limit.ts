/**
 * Minimal in-memory sliding-window rate limiter.
 * Good enough for a single server instance; on serverless with many instances,
 * swap for a shared store (e.g. Upstash Redis) — the call site stays the same.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return { ok: true, retryAfter: 0 };
}
