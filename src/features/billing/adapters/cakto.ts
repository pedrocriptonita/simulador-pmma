import "server-only";

import { timingSafeEqual } from "node:crypto";
import { PurchaseStatus } from "@prisma/client";
import { z } from "zod";
import { getWebhookSecret } from "@/lib/billing/config";
import { prisma } from "@/lib/prisma";
import { processWebhookEvent, type ProcessResult } from "@/services/billing";

/**
 * Adapter da Cakto.
 *
 * Diferenças em relação ao contrato genérico (documentadas para quem for
 * mexer aqui no futuro):
 * - O segredo do webhook vem DENTRO do corpo (`payload.secret`), não em
 *   header/query — é a Cakto quem gera esse valor ao criar o webhook no
 *   painel dela; não somos nós que escolhemos.
 * - Não existe campo de referência externa customizável no link de
 *   checkout da Cakto (só aceita pré-preencher name/email/cpf/phone/
 *   coupon). Por isso identificamos o usuário pelo e-mail do comprador.
 * - `amount` vem em reais decimais (ex.: 5 = R$ 5,00), não em centavos.
 *
 * Referência: https://docs.cakto.com.br (payload de exemplo obtido via
 * a documentação pública deles em 2026-07).
 */

const caktoPayloadSchema = z.object({
  event: z.string().trim().min(1),
  secret: z.string().trim().min(1),
  data: z.object({
    id: z.string().trim().min(1),
    status: z.string().trim().min(1).optional(),
    amount: z.number().optional(),
    customer: z
      .object({
        email: z.string().trim().min(1).optional(),
      })
      .partial()
      .optional(),
  }),
});

/** Eventos que efetivamente mudam o acesso do usuário. Os demais (checkout
 * iniciado, PIX/boleto gerado, venda recusada, assinatura renovada etc.)
 * são recebidos e ignorados com 200 — não é erro, só não geram ação. */
const EVENT_STATUS_MAP: Record<string, PurchaseStatus> = {
  purchase_approved: PurchaseStatus.PAID,
  refund: PurchaseStatus.REFUNDED,
  chargeback: PurchaseStatus.REFUNDED,
  subscription_canceled: PurchaseStatus.CANCELED,
};

export function verifyCaktoSecret(payload: unknown): boolean {
  const expected = getWebhookSecret();
  if (!expected) return false;
  if (!payload || typeof payload !== "object") return false;

  const provided = (payload as Record<string, unknown>).secret;
  if (typeof provided !== "string") return false;

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

export type CaktoHandleResult =
  | {
      httpStatus: 200;
      body: { received: true; result: ProcessResult | { ignored: true; event: string } };
    }
  | { httpStatus: 400; body: { error: string } };

/** Processa o payload já validado quanto ao segredo (verifyCaktoSecret). */
export async function handleCaktoWebhook(payload: unknown): Promise<CaktoHandleResult> {
  const parsed = caktoPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { httpStatus: 400, body: { error: "unparseable payload" } };
  }
  const body = parsed.data;

  const status = EVENT_STATUS_MAP[body.event];
  if (!status) {
    // Evento válido da Cakto que não altera acesso (ex.: pix_gerado).
    return {
      httpStatus: 200,
      body: { received: true, result: { ignored: true, event: body.event } },
    };
  }

  const email = body.data.customer?.email;
  if (!email) {
    return { httpStatus: 400, body: { error: "missing customer email" } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      httpStatus: 200,
      body: { received: true, result: { ok: false, reason: "user_not_found" } },
    };
  }

  const amountCents =
    typeof body.data.amount === "number" && Number.isFinite(body.data.amount)
      ? Math.round(body.data.amount * 100)
      : null;

  const result = await processWebhookEvent({
    externalId: body.data.id,
    status,
    userId: user.id,
    email,
    amountCents,
  });

  return { httpStatus: 200, body: { received: true, result } };
}
