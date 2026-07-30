"use client";

import { useEffect } from "react";
import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";

type PurchaseTrackerProps = {
  transactionId: string;
  value: number;
  email: string;
  currency?: string;
};

/**
 * Dispara o Purchase (GTM/Meta Pixel) na tela de sucesso do checkout.
 * Guarda em sessionStorage por transactionId para não contar a mesma
 * compra de novo se o usuário atualizar a página (ver planos/sucesso/page.tsx).
 *
 * `email` alimenta a Correspondência Avançada do Meta: o próprio pixel
 * aplica hash antes de enviar — nada em texto puro sai do navegador.
 *
 * `event_id` é o mesmo ID que a Conversions API manda do webhook
 * (lib/meta/capi.ts). É por ele que o Meta deduplica: se o comprador voltar
 * para esta tela, os dois disparos viram uma conversão só.
 */
export function PurchaseTracker({
  transactionId,
  value,
  email,
  currency = "BRL",
}: PurchaseTrackerProps) {
  useEffect(() => {
    const key = `purchase_tracked_${transactionId}`;
    if (sessionStorage.getItem(key)) return;
    pushToDataLayer({
      event: GTM_EVENTS.purchase,
      value,
      currency,
      transaction_id: transactionId,
      event_id: transactionId,
      user_email: email,
    });
    sessionStorage.setItem(key, "1");
  }, [transactionId, value, currency, email]);

  return null;
}
