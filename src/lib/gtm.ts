/** ID do container GTM (tagmanager.google.com). Vazio em dev até configurar o .env. */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Nomes dos eventos personalizados enviados ao dataLayer. Precisam bater
 * exatamente com os acionadores de "Evento personalizado" configurados
 * no container do GTM para disparar as tags do Meta Pixel.
 */
export const GTM_EVENTS = {
  pageView: "page_view",
  registrationComplete: "cadastro_completo",
  purchase: "compra_concluida",
} as const;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Envia um evento ao dataLayer do GTM. No-op no servidor e antes do GTM carregar. */
export function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
