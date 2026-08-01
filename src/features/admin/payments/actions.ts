"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth-guard";
import { processWebhookEvent } from "@/services/billing";

export type LinkPaymentState = { error?: string; success?: string };

/**
 * Vincula um pagamento órfão a um usuário e aplica o efeito no acesso.
 *
 * Reaproveita `processWebhookEvent` de propósito: é o mesmo caminho que o
 * webhook percorre, então a compra é gravada, o plano sobe e a conversão
 * server-side dispara exatamente como numa venda normal. Duplicar essa
 * lógica aqui abriria espaço para os dois fluxos divergirem.
 */
export async function linkPaymentAction(
  _prevState: LinkPaymentState,
  formData: FormData,
): Promise<LinkPaymentState> {
  await requireAdmin();

  const paymentId = String(formData.get("paymentId") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!paymentId) return { error: "Pagamento não informado." };
  if (!email) return { error: "Informe o e-mail da conta que deve receber o acesso." };

  const payment = await prisma.unmatchedPayment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: "Pagamento não encontrado." };
  if (payment.resolvedAt) return { error: "Este pagamento já foi vinculado." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      error: `Nenhuma conta cadastrada com "${email}". Confirme o e-mail com o cliente — ou peça que ele crie a conta antes de vincular.`,
    };
  }

  const result = await processWebhookEvent({
    externalId: payment.externalId,
    status: payment.status,
    userId: user.id,
    email,
    amountCents: payment.amountCents,
  });

  if (!result.ok) {
    return { error: `Não foi possível aplicar o pagamento: ${result.reason}` };
  }

  await prisma.unmatchedPayment.update({
    where: { id: paymentId },
    data: { resolvedAt: new Date(), resolvedUserId: user.id },
  });

  revalidatePath("/admin/pagamentos");
  return { success: `Acesso liberado para ${email}.` };
}

/**
 * Marca como resolvido sem liberar acesso — para eventos que não exigem
 * ação (um chargeback de compra que nunca existiu, um teste do provedor).
 */
export async function dismissPaymentAction(paymentId: string): Promise<void> {
  await requireAdmin();

  await prisma.unmatchedPayment.updateMany({
    where: { id: paymentId, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
  revalidatePath("/admin/pagamentos");
}
