import type { MiddlewareHandler } from 'hono';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(opts: { windowMs: number; max: number; keyPrefix?: string }): MiddlewareHandler {
  const refillRate = opts.max / opts.windowMs;
  return async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown';
    const key = `${opts.keyPrefix ?? 'rl'}:${ip}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { tokens: opts.max, lastRefill: now };
      buckets.set(key, bucket);
    } else {
      const elapsed = now - bucket.lastRefill;
      bucket.tokens = Math.min(opts.max, bucket.tokens + elapsed * refillRate);
      bucket.lastRefill = now;
    }
    if (bucket.tokens < 1) {
      return c.json({ error: 'too_many_requests' }, 429);
    }
    bucket.tokens -= 1;
    await next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now - b.lastRefill > 60 * 60 * 1000) buckets.delete(k);
  }
}, 10 * 60 * 1000).unref();
