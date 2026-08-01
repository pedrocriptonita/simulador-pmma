"use server";

import { redirect } from "next/navigation";
import { PAYMENT_PROVIDER, getCheckoutUrl } from "@/lib/billing/config";
import { formatRetryAfter, getClientIp, rateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/services/auth-guard";
import { getUserWithPlan } from "@/services/users";

/**
 * Inicia o checkout externo: valida sessão e redireciona ao link do
 * provedor, identificando o comprador.
 *
 * - Provedor "generic" (contrato canônico): manda `external_reference`
 *   = userId, reenviado pelo provedor no webhook.
 * - Provedor "cakto": não existe campo de referência customizável no
 *   link de checkout dela — só pré-preenchimento de name/email/cpf/
 *   phone/coupon. Por isso mandamos só `email`, que volta no webhook
 *   dentro de `data.customer.email` e é usado para identificar o
 *   usuário lá (ver features/billing/adapters/cakto.ts).
 */
export async function startCheckoutAction(): Promise<void> {
  const authUser = await requireUser();

  const ip = await getClientIp();
  const limit = rateLimit(`checkout:${ip}`, 10, 10 * 60_000);
  if (!limit.ok) {
    redirect(
      `/planos?erro=checkout_indisponivel&espera=${formatRetryAfter(limit.retryAfterSeconds)}`,
    );
  }

  const url = getCheckoutUrl();
  if (!url) {
    console.error(
      "[checkout] CHECKOUT_URL ausente ou inválida — precisa ser URL absoluta com https://",
    );
    redirect("/planos?erro=checkout_indisponivel");
  }

  const user = await getUserWithPlan(authUser.id);
  if (!user) redirect("/login");

  if (PAYMENT_PROVIDER === "cakto") {
    url.searchParams.set("email", user.email);
    if (user.name) url.searchParams.set("name", user.name);
  } else {
    url.searchParams.set("external_reference", user.id);
    url.searchParams.set("email", user.email);
  }

  redirect(url.toString());
}
