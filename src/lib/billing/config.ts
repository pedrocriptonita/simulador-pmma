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

/**
 * Provedor de checkout ativo. "generic" = contrato canônico (segredo em
 * header/query, external_reference = userId) — usado por Kirvano/Cakto
 * clássico. "cakto" = adapter específico (segredo no corpo do JSON,
 * identificação do usuário por e-mail — a Cakto não suporta campo
 * customizado de referência externa no link de checkout).
 */
export const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER ?? "generic") as "generic" | "cakto";

/** Segredo compartilhado que o provedor envia no webhook. */
export function getWebhookSecret(): string {
  return process.env.CHECKOUT_WEBHOOK_SECRET ?? "";
}

/**
 * URL absoluta do checkout, ou `null` se não configurada ou inválida.
 *
 * Valida o esquema de propósito: um valor sem protocolo
 * ("pay.cakto.com.br/abc") ou um valor trocado de campo ("cakto", que
 * pertence a PAYMENT_PROVIDER) passava no antigo teste de string não-vazia,
 * o botão renderizava habilitado e só então `new URL()` lançava dentro da
 * Server Action — o clique morria sem nada na tela. Aqui a configuração
 * inválida cai no mesmo estado visível de "não configurado".
 *
 * Retorna sempre uma instância nova: quem chama adiciona query params, e um
 * objeto URL de módulo seria compartilhado entre requisições — o e-mail de
 * um usuário vazaria no link de checkout do seguinte.
 */
export function getCheckoutUrl(): URL | null {
  if (!CHECKOUT_URL) return null;
  try {
    const url = new URL(CHECKOUT_URL);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export function isCheckoutConfigured(): boolean {
  return getCheckoutUrl() !== null;
}
