import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetRequestForm } from "@/features/auth/components/reset-request-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link para o seu e-mail para você definir uma nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetRequestForm />
      </CardContent>
    </Card>
  );
}
