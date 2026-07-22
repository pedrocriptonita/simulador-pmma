import { headers } from "next/headers";

/**
 * Rate limiter em memória (janela fixa por chave).
 *
 * Limitação conhecida: em serverless (Vercel) cada instância tem seu
 * próprio Map, então o limite vale por instância — ainda assim corta
 * a força de ataques de credential stuffing/bots num MVP. Na Fase 7,
 * se necessário, trocar por um store durável (ex.: Upstash Redis).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

/** IP do cliente (Vercel/proxies preenchem x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

export function formatRetryAfter(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }
  return `${seconds} segundo${seconds > 1 ? "s" : ""}`;
}
