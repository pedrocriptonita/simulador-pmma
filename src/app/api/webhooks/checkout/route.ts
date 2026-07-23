import { NextResponse } from "next/server";
import { parseWebhookPayload, verifyWebhookSecret } from "@/features/billing/webhook";
import { logEvent } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { processWebhookEvent } from "@/services/billing";

// Prisma exige runtime Node.js (não edge).
export const runtime = "nodejs";

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Webhook do checkout externo (roadmap 6.3).
 * Sempre responde 200 para eventos válidos porém sem ação (usuário
 * desconhecido, etc.) para não gerar retries infinitos do provedor.
 * 401 = assinatura inválida · 400 = payload malformado.
 */
export async function POST(request: Request) {
  // Rate limit por IP para conter flood (o segredo já barra falsos, mas
  // isto protege contra abuso mesmo com segredo vazado).
  const limit = rateLimit(`webhook:${clientIp(request)}`, 120, 60_000);
  if (!limit.ok) {
    logEvent("checkout_webhook", { result: "rate_limited" });
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  if (!verifyWebhookSecret(request)) {
    logEvent("checkout_webhook", { result: "rejected_signature" });
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    logEvent("checkout_webhook", { result: "invalid_json" });
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = parseWebhookPayload(payload);
  if (!event) {
    logEvent("checkout_webhook", { result: "unparseable_payload" });
    return NextResponse.json({ error: "unparseable payload" }, { status: 400 });
  }

  const result = await processWebhookEvent(event);

  logEvent("checkout_webhook", {
    externalId: event.externalId,
    status: event.status,
    userId: event.userId,
    result: result.ok ? result.action : result.reason,
  });

  // Mesmo sem ação (usuário/plano não encontrado), 200 evita retries.
  return NextResponse.json({ received: true, result });
}
