"use client";

import { useEffect } from "react";
import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";

type PurchaseTrackerProps = {
  transactionId: string;
  value: number;
  currency?: string;
};

/**
 * Dispara o Purchase (GTM/Meta Pixel) na tela de sucesso do checkout.
 * Guarda em sessionStorage por transactionId para não contar a mesma
 * compra de novo se o usuário atualizar a página (ver planos/sucesso/page.tsx).
 */
export function PurchaseTracker({ transactionId, value, currency = "BRL" }: PurchaseTrackerProps) {
  useEffect(() => {
    const key = `purchase_tracked_${transactionId}`;
    if (sessionStorage.getItem(key)) return;
    pushToDataLayer({
      event: GTM_EVENTS.purchase,
      value,
      currency,
      transaction_id: transactionId,
    });
    sessionStorage.setItem(key, "1");
  }, [transactionId, value, currency]);

  return null;
}
