"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, type AuthActionState } from "@/features/auth/actions";
import { AuthMessage } from "./auth-message";
import { GoogleButton } from "./google-button";

const initialState: AuthActionState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <AuthMessage state={state} />
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/recuperar-senha"
              className="text-muted-foreground text-xs underline underline-offset-4"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">ou</span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton />

      <p className="text-muted-foreground text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-foreground underline underline-offset-4">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
