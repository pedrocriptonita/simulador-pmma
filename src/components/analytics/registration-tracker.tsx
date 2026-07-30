"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";

/**
 * Dispara o CompleteRegistration (GTM/Meta Pixel) quando o usuário chega ao
 * dashboard vindo do cadastro com sessão criada na hora (signUp em
 * features/auth/actions.ts redireciona para /dashboard?cadastro=sucesso).
 * Limpa o parâmetro da URL depois, para não disparar de novo em um refresh.
 *
 * `email` alimenta a Correspondência Avançada do Meta: o próprio pixel
 * aplica hash antes de enviar — nada em texto puro sai do navegador.
 */
export function RegistrationTracker({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const justRegistered = searchParams.get("cadastro") === "sucesso";
  // Conversão não pode duplicar: o StrictMode (dev) roda o efeito duas vezes,
  // e o replace da URL não chega a tempo de barrar a segunda execução.
  const sent = useRef(false);

  useEffect(() => {
    if (!justRegistered || sent.current) return;
    sent.current = true;
    pushToDataLayer({ event: GTM_EVENTS.registrationComplete, user_email: email });
    router.replace("/dashboard");
  }, [justRegistered, router, email]);

  return null;
}
