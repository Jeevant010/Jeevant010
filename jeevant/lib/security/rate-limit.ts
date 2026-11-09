import connectDB from "@/lib/db";
import { RateLimitBucket } from "@/lib/database/models";

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

export async function rateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_STORE === "memory") {
    return rateLimit(key, limit, windowMs);
  }

  try {
    await connectDB();
    const now = new Date();
    const current = await RateLimitBucket.findOne({ key }).lean();

    if (!current || new Date(current.resetAt).getTime() <= now.getTime()) {
      const resetAt = new Date(now.getTime() + windowMs);
      await RateLimitBucket.updateOne({ key }, { $set: { key, count: 1, resetAt } }, { upsert: true });
      return { ok: 1 <= limit, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
    }

    await RateLimitBucket.updateOne({ key }, { $inc: { count: 1 } });
    const count = Number(current.count || 0) + 1;
    const ok = count <= limit;

    return {
      ok,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: ok
        ? 0
        : Math.max(1, Math.ceil((new Date(current.resetAt).getTime() - now.getTime()) / 1000)),
    };
  } catch {
    return rateLimit(key, limit, windowMs);
  }
}
