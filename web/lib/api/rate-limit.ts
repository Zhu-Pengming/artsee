import type { NextRequest } from "next/server";

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function clientKey(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "local";
}

export function checkRateLimit(req: NextRequest, options: RateLimitOptions) {
  const now = Date.now();
  const key = `${options.keyPrefix}:${clientKey(req)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    cleanupBuckets(now);
    return { ok: true, remaining: options.max - 1, resetAt: now + options.windowMs };
  }

  if (current.count >= options.max) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { ok: true, remaining: options.max - current.count, resetAt: current.resetAt };
}

function cleanupBuckets(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
