import "server-only";

import { PurchaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ACCESS_EXPIRES_AT, FREE_PLAN_SLUG, PAID_PLAN_SLUG } from "@/lib/billing/config";

/** Evento de pagamento normalizado (independente do provedor). */
export type NormalizedEvent = {
  /** ID da transação no provedor — chave de idempotência (Purchase.externalId). */
  externalId: string;
  status: PurchaseStatus;
  /** ID do usuário, vindo do external_reference que enviamos ao checkout. */
  userId: string;
  email?: string | null;
  /** Valor em centavos; se ausente, usa o preço do plano. */
  amountCents?: number | null;
};

export type ProcessResult =
  | { ok: true; action: "granted" | "revoked" | "recorded" | "duplicate" }
  | { ok: false; reason: "user_not_found" | "plan_not_found" };

const REVOKE_STATUSES: PurchaseStatus[] = [
  PurchaseStatus.REFUNDED,
  PurchaseStatus.CANCELED,
  PurchaseStatus.EXPIRED,
];

/**
 * Processa um evento de webhook do checkout externo (roadmap 6.3).
 * - Idempotente: mesmo externalId + mesmo status => ignora.
 * - PAID: libera o plano pago e define accessExpiresAt = dia da prova.
 * - REFUNDED/CANCELED/EXPIRED: reverte para free (se não houver outra
 *   compra paga vigente do mesmo usuário).
 * - PENDING: apenas registra a compra, sem alterar o acesso.
 */
export async function processWebhookEvent(event: NormalizedEvent): Promise<ProcessResult> {
  const [user, paidPlan, freePlan] = await Promise.all([
    prisma.user.findUnique({ where: { id: event.userId } }),
    prisma.plan.findUnique({ where: { slug: PAID_PLAN_SLUG } }),
    prisma.plan.findUnique({ where: { slug: FREE_PLAN_SLUG } }),
  ]);

  if (!user) return { ok: false, reason: "user_not_found" };
  if (!paidPlan || !freePlan) return { ok: false, reason: "plan_not_found" };

  const existing = await prisma.purchase.findUnique({
    where: { externalId: event.externalId },
  });

  // Duplicata exata: evento repetido sem mudança de status => ignora
  if (existing && existing.status === event.status) {
    return { ok: true, action: "duplicate" };
  }

  const amountCents = event.amountCents ?? existing?.amountCents ?? paidPlan.priceCents;
  const paidAt =
    event.status === PurchaseStatus.PAID ? (existing?.paidAt ?? new Date()) : existing?.paidAt;

  // Upsert da compra pela chave única externalId
  await prisma.purchase.upsert({
    where: { externalId: event.externalId },
    update: { status: event.status, amountCents, paidAt: paidAt ?? null },
    create: {
      userId: user.id,
      planId: paidPlan.id,
      externalId: event.externalId,
      status: event.status,
      amountCents,
      paidAt: paidAt ?? null,
    },
  });

  // Aplica o efeito no acesso do usuário
  if (event.status === PurchaseStatus.PAID) {
    await prisma.user.update({
      where: { id: user.id },
      data: { planId: paidPlan.id, accessExpiresAt: ACCESS_EXPIRES_AT },
    });
    return { ok: true, action: "granted" };
  }

  if (REVOKE_STATUSES.includes(event.status)) {
    // Só revoga se não houver OUTRA compra paga vigente do mesmo usuário
    const otherPaid = await prisma.purchase.count({
      where: {
        userId: user.id,
        status: PurchaseStatus.PAID,
        externalId: { not: event.externalId },
      },
    });
    if (otherPaid === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { planId: freePlan.id, accessExpiresAt: null },
      });
      return { ok: true, action: "revoked" };
    }
    return { ok: true, action: "recorded" };
  }

  // PENDING (ou outro): apenas registrado
  return { ok: true, action: "recorded" };
}
