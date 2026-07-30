import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";

/**
 * O app é uma SPA (App Router): navegações por <Link> não recarregam a
 * página, então a tag "All Pages" do GTM só dispara PageView no primeiro
 * carregamento. Isso reenvia um PageView "virtual" a cada troca de rota
 * client-side — essencial para os públicos de remarketing por URL
 * (seção 7 da oferta) funcionarem em todas as páginas do funil.
 */
export function onRouterTransitionStart(url: string) {
  pushToDataLayer({ event: GTM_EVENTS.pageView, page_path: url });
}
