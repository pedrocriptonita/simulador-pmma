import "server-only";

/** Slug do plano pago (deve existir no seed). */
export const PAID_PLAN_SLUG = "ate-a-prova";
export const FREE_PLAN_SLUG = "free";

/**
 * Fim do acesso pago = dia da prova (23:59:59 no horário do Maranhão).
 * Pacote único "até a prova" — não há renovação recorrente no MVP.
 */
export const ACCESS_EXPIRES_AT = new Date("2026-10-11T23:59:59-03:00");

/**
 * Link do checkout externo do provedor (Kirvano/Cakto/Mercado Pago).
 * Definido a partir do provedor escolhido no lançamento. Vazio => o
 * botão de assinar fica em modo "em configuração".
 */
export const CHECKOUT_URL = process.env.CHECKOUT_URL ?? "";

/** Segredo compartilhado que o provedor envia no webhook. */
export function getWebhookSecret(): string {
  return process.env.CHECKOUT_WEBHOOK_SECRET ?? "";
}

export function isCheckoutConfigured(): boolean {
  return CHECKOUT_URL.length > 0;
}
