import "server-only";

import { createHash } from "node:crypto";
import { logEvent } from "@/lib/logger";

/**
 * Conversions API do Meta (envio server-side de conversões).
 *
 * Por que existe: o evento Purchase do navegador só dispara se o comprador
 * voltar para /planos/sucesso. Com Pix — meio dominante deste público — ele
 * paga no app do banco e frequentemente nunca retorna, então a venda entra
 * mas a conversão não é registrada. Aqui o evento sai do webhook, que roda
 * no servidor e independe do cliente voltar.
 *
 * Deduplicação: o `event_id` é o ID da transação no provedor, o mesmo que o
 * PurchaseTracker manda no dataLayer. O Meta descarta a segunda cópia quando
 * `event_name` + `event_id` coincidem, então navegador e servidor podem
 * disparar o mesmo evento sem contar em dobro.
 */

const GRAPH_VERSION = "v21.0";
/** Webhook não pode ficar pendurado: o pagamento já foi processado. */
const TIMEOUT_MS = 3000;

/** Meta exige os identificadores normalizados (lowercase/trim) e em SHA-256. */
function hashed(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaPurchaseEvent = {
  /** ID da transação no provedor — chave de deduplicação com o pixel. */
  eventId: string;
  amountCents: number;
  /** Sem ao menos um identificador o Meta rejeita o evento. */
  email: string;
  currency?: string;
  eventTimeMs?: number;
  /** URL da página de conclusão, melhora a atribuição. */
  sourceUrl?: string;
};

export function isMetaCapiConfigured(): boolean {
  return Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN);
}

/**
 * Envia um Purchase para o Meta. Nunca lança: falha aqui não pode derrubar o
 * webhook, senão o provedor reenvia o evento e o comprador fica sem acesso.
 * Sem as variáveis configuradas, é no-op silencioso.
 */
export async function sendPurchaseToMeta(event: MetaPurchaseEvent): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor((event.eventTimeMs ?? Date.now()) / 1000),
        event_id: event.eventId,
        action_source: "website",
        ...(event.sourceUrl ? { event_source_url: event.sourceUrl } : {}),
        user_data: { em: [hashed(event.email)] },
        custom_data: {
          value: event.amountCents / 100,
          currency: event.currency ?? "BRL",
        },
      },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, access_token: accessToken }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      // Corpo do erro do Meta ajuda a diagnosticar token expirado/pixel errado.
      const detail = await response.text().catch(() => "");
      logEvent("meta_capi", {
        result: "http_error",
        status: response.status,
        eventId: event.eventId,
        detail: detail.slice(0, 500),
      });
      return;
    }

    logEvent("meta_capi", { result: "sent", eventId: event.eventId });
  } catch (error) {
    logEvent("meta_capi", {
      result: error instanceof Error && error.name === "AbortError" ? "timeout" : "failed",
      eventId: event.eventId,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}
