"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";

/**
 * Dispara o CompleteRegistration (GTM/Meta Pixel) quando o usuário chega ao
 * dashboard vindo do cadastro com sessão criada na hora (signUp em
 * features/auth/actions.ts redireciona para /dashboard?cadastro=sucesso).
 * Limpa o parâmetro da URL depois, para não disparar de novo em um refresh.
 */
export function RegistrationTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const justRegistered = searchParams.get("cadastro") === "sucesso";

  useEffect(() => {
    if (!justRegistered) return;
    pushToDataLayer({ event: GTM_EVENTS.registrationComplete });
    router.replace("/dashboard");
  }, [justRegistered, router]);

  return null;
}
