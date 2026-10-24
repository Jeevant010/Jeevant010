type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size <= MAX_KEYS) return;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (buckets.size <= MAX_KEYS) break;
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > MAX_KEYS) prune(now);
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 };
}

export function rateLimitKey(prefix: string, request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

export function resetRateLimits(): void {
  buckets.clear();
}
