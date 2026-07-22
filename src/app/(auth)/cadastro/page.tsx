import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta grátis</CardTitle>
        <CardDescription>Faça 1 simulado gratuito por semana no formato Cebraspe.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
