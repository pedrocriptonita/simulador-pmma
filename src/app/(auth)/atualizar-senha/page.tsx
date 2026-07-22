import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export const metadata: Metadata = { title: "Nova senha" };

export default function AtualizarSenhaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir nova senha</CardTitle>
        <CardDescription>Escolha uma nova senha para a sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
