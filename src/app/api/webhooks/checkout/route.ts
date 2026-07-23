import { NextResponse } from "next/server";
import { parseWebhookPayload, verifyWebhookSecret } from "@/features/billing/webhook";
import { processWebhookEvent } from "@/services/billing";

// Prisma exige runtime Node.js (não edge).
export const runtime = "nodejs";

/** Log estruturado de auditoria (capturado pelos logs da Vercel). */
function logEvent(data: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "checkout_webhook", ts: new Date().toISOString(), ...data }));
}

/**
 * Webhook do checkout externo (roadmap 6.3).
 * Sempre responde 200 para eventos válidos porém sem ação (usuário
 * desconhecido, etc.) para não gerar retries infinitos do provedor.
 * 401 = assinatura inválida · 400 = payload malformado.
 */
export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    logEvent({ result: "rejected_signature" });
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    logEvent({ result: "invalid_json" });
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = parseWebhookPayload(payload);
  if (!event) {
    logEvent({ result: "unparseable_payload" });
    return NextResponse.json({ error: "unparseable payload" }, { status: 400 });
  }

  const result = await processWebhookEvent(event);

  logEvent({
    externalId: event.externalId,
    status: event.status,
    userId: event.userId,
    result: result.ok ? result.action : result.reason,
  });

  // Mesmo sem ação (usuário/plano não encontrado), 200 evita retries.
  return NextResponse.json({ received: true, result });
}
