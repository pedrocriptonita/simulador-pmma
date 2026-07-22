import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { getUserWithPlan } from "@/services/users";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await getUserWithPlan(authUser.id);
  if (!user) redirect("/login");

  const hasPaidAccess =
    user.plan?.slug !== "free" && !!user.accessExpiresAt && user.accessExpiresAt >= new Date();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user.name ?? user.email.split("@")[0]}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            Sair
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Seu plano
            <Badge variant={hasPaidAccess ? "default" : "secondary"}>
              {user.plan?.name ?? "Gratuito"}
            </Badge>
            {user.role === "ADMIN" ? <Badge variant="outline">Admin</Badge> : null}
          </CardTitle>
          <CardDescription>
            {hasPaidAccess
              ? `Acesso completo liberado até ${user.accessExpiresAt!.toLocaleDateString("pt-BR")}.`
              : "Plano gratuito: 1 simulado por semana. Faça upgrade para acesso ilimitado até a prova."}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Treinar para a prova</CardTitle>
          <CardDescription>
            Gere um simulado no formato Cebraspe, responda com cronômetro e veja sua nota líquida
            com gabarito comentado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/simulados/novo">Fazer simulado</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/simulados">Meus simulados</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/planos">Planos</Link>
          </Button>
          {user.role === "ADMIN" ? (
            <Button variant="outline" asChild>
              <Link href="/admin">Painel admin</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
