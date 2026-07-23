import "server-only";

import { timingSafeEqual } from "node:crypto";
import { PurchaseStatus } from "@prisma/client";
import { z } from "zod";
import { getWebhookSecret } from "@/lib/billing/config";
import type { NormalizedEvent } from "@/services/billing";

/** Shape mínimo aceito do payload do webhook (tolerante a campos extras). */
const webhookPayloadSchema = z
  .object({
    transaction_id: z.string().trim().min(1).optional(),
    id: z.string().trim().min(1).optional(),
    order_id: z.string().trim().min(1).optional(),
    status: z.string().trim().min(1).optional(),
    event: z.string().trim().min(1).optional(),
    external_reference: z.string().trim().min(1).optional(),
    reference: z.string().trim().min(1).optional(),
    email: z.string().trim().optional(),
    amount_cents: z.number().optional(),
    amount: z.number().optional(),
    customer: z
      .object({
        email: z.string().trim().optional(),
        external_reference: z.string().trim().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();

/**
 * Verificação do segredo compartilhado do provedor (constant-time).
 * O provedor envia o segredo no header `x-webhook-secret` ou, para
 * provedores que só permitem segredo na URL, no query param `?secret=`.
 * Falha fechada: sem segredo configurado no ambiente => rejeita.
 */
export function verifyWebhookSecret(request: Request): boolean {
  const expected = getWebhookSecret();
  if (!expected) return false;

  const url = new URL(request.url);
  const provided = request.headers.get("x-webhook-secret") ?? url.searchParams.get("secret") ?? "";

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Mapeia strings de status/evento comuns dos provedores para o nosso enum.
 * Aceita tanto `status: "paid"` quanto `event: "payment.paid"`.
 */
function mapStatus(raw: string): PurchaseStatus | null {
  const value = raw.toLowerCase();
  if (value.includes("refund") || value.includes("chargeback") || value.includes("estorn")) {
    return PurchaseStatus.REFUNDED;
  }
  if (value.includes("cancel")) return PurchaseStatus.CANCELED;
  if (value.includes("expire")) return PurchaseStatus.EXPIRED;
  if (value.includes("paid") || value.includes("approved") || value.includes("complete")) {
    return PurchaseStatus.PAID;
  }
  if (value.includes("pending") || value.includes("waiting")) return PurchaseStatus.PENDING;
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Converte o payload do webhook no evento normalizado.
 *
 * Contrato canônico (documentado para o provedor / adapter):
 * {
 *   "transaction_id": "abc123",           // ID único da transação
 *   "status": "paid|refunded|canceled|pending|expired",  // ou "event"
 *   "external_reference": "<userId>",     // reenviado por nós ao checkout
 *   "email": "cliente@exemplo.com",       // opcional
 *   "amount_cents": 3990                   // opcional
 * }
 *
 * Ao escolher o provedor real (Kirvano/Cakto/Mercado Pago), adicione um
 * adapter que traduza o payload dele para esta forma antes de chamar aqui.
 */
export function parseWebhookPayload(payload: unknown): NormalizedEvent | null {
  const parsed = webhookPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const body = parsed.data;

  const externalId = asString(body.transaction_id) ?? asString(body.id) ?? asString(body.order_id);
  if (!externalId) return null;

  const statusRaw = asString(body.status) ?? asString(body.event);
  if (!statusRaw) return null;
  const status = mapStatus(statusRaw);
  if (!status) return null;

  const userId =
    asString(body.external_reference) ??
    asString(body.reference) ??
    asString(body.customer?.external_reference);
  if (!userId) return null;

  const email = asString(body.email) ?? asString(body.customer?.email);

  const amountRaw = body.amount_cents ?? body.amount;
  const amountCents =
    typeof amountRaw === "number" && Number.isFinite(amountRaw) ? Math.round(amountRaw) : null;

  return { externalId, status, userId, email, amountCents };
}
