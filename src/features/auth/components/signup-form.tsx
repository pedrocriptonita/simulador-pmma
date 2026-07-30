"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signUp, type AuthActionState } from "@/features/auth/actions";
import { GTM_EVENTS, pushToDataLayer } from "@/lib/gtm";
import { AuthMessage } from "./auth-message";
import { GoogleButton } from "./google-button";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  // Caminho com confirmação por e-mail: a sessão não é criada na hora, então
  // o redirect com ?cadastro=sucesso (RegistrationTracker) não roda. O
  // cadastro em si já foi concluído aqui, então disparamos o evento direto.
  useEffect(() => {
    if (state.success) {
      pushToDataLayer({ event: GTM_EVENTS.registrationComplete });
    }
  }, [state.success]);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <AuthMessage state={state} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Seu nome" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando conta..." : "Criar conta grátis"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">ou</span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton />

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}
