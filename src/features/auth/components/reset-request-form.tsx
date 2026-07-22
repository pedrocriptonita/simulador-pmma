"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, type AuthActionState } from "@/features/auth/actions";
import { AuthMessage } from "./auth-message";

const initialState: AuthActionState = {};

export function ResetRequestForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthMessage state={state} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail cadastrado</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Lembrou a senha?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
