import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isRealValue, serverEnv } from "@/lib/env";

type Result = { ok: boolean; remaining: number; resetAt: number };

// ── In-memory fallback (per server instance; fine for dev & single-region) ──
const buckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSec: number): Result {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, remaining: limit - 1, resetAt: now + windowSec * 1000 };
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

// ── Upstash (if configured) ──
let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function upstash(limit: number, windowSec: number): Ratelimit | null {
  if (!isRealValue(serverEnv.upstashUrl) || !isRealValue(serverEnv.upstashToken)) return null;
  redis ??= new Redis({ url: serverEnv.upstashUrl, token: serverEnv.upstashToken });
  const id = `${limit}:${windowSec}`;
  let l = limiters.get(id);
  if (!l) {
    l = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`), prefix: "hacksyra:rl" });
    limiters.set(id, l);
  }
  return l;
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<Result> {
  const l = upstash(limit, windowSec);
  if (l) {
    try {
      const r = await l.limit(key);
      return { ok: r.success, remaining: r.remaining, resetAt: r.reset };
    } catch {
      /* fall through to memory if Redis is unreachable */
    }
  }
  return memoryLimit(key, limit, windowSec);
}

