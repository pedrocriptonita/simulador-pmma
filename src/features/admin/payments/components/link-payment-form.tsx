"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { linkPaymentAction, type LinkPaymentState } from "../actions";

const initialState: LinkPaymentState = {};

export function LinkPaymentForm({
  paymentId,
  payerEmail,
}: {
  paymentId: string;
  payerEmail: string;
}) {
  const [state, formAction, pending] = useActionState(linkPaymentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="paymentId" value={paymentId} />

      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`email-${paymentId}`}>E-mail da conta que deve receber o acesso</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={`email-${paymentId}`}
            name="email"
            type="email"
            /* Pré-preenche com o e-mail do pagamento: às vezes a conta existe
               e o que falhou foi só o caixa ou um espaço. */
            defaultValue={payerEmail}
            placeholder="email@docliente.com"
            required
            className="sm:flex-1"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Liberando…" : "Vincular e liberar acesso"}
          </Button>
        </div>
      </div>
    </form>
  );
}
