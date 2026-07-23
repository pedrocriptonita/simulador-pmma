import "server-only";

/**
 * Log estruturado em JSON (uma linha por evento) — legível pelos logs
 * da Vercel e fácil de filtrar por `scope`. Sem PII além de IDs.
 */
export function logEvent(scope: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ scope, ts: new Date().toISOString(), ...data }));
}
