"use server";

import { redirect } from "next/navigation";
import { CHECKOUT_URL, isCheckoutConfigured } from "@/lib/billing/config";
import { requireUser } from "@/services/auth-guard";
import { getUserWithPlan } from "@/services/users";

/**
 * Inicia o checkout externo: valida sessão, monta o link do provedor
 * com a identificação do usuário (external_reference = id) e redireciona.
 * O provedor reenvia esse external_reference no webhook, ligando o
 * pagamento ao usuário.
 */
export async function startCheckoutAction(): Promise<void> {
  const authUser = await requireUser();

  if (!isCheckoutConfigured()) {
    redirect("/planos?erro=checkout_indisponivel");
  }

  const user = await getUserWithPlan(authUser.id);
  if (!user) redirect("/login");

  const url = new URL(CHECKOUT_URL);
  url.searchParams.set("external_reference", user.id);
  if (user.email) url.searchParams.set("email", user.email);

  redirect(url.toString());
}
