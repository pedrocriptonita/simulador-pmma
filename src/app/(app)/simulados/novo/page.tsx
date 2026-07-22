import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "@/services/access";
import { getAuthUser } from "@/services/auth-guard";
import { NewExamForm } from "@/features/exam/components/new-exam-form";

export const metadata: Metadata = { title: "Novo simulado" };

export default async function NovoSimuladoPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const access = await checkAccess(authUser.id);

  if (access.status !== "allowed") {
    const isLimit = access.status === "blocked_free_limit";
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl">
              {isLimit ? "Você já usou seu simulado grátis desta semana" : "Seu acesso expirou"}
            </CardTitle>
            <CardDescription>
              {isLimit
                ? `O plano gratuito libera 1 simulado por semana. O próximo libera em ${access.nextAvailableAt.toLocaleDateString("pt-BR")} — ou destrave simulados ilimitados agora.`
                : "Renove seu acesso para continuar treinando até a prova de 11/10/2026."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <Button size="lg" asChild>
              <Link href={`/planos?motivo=${isLimit ? "limite" : "expirado"}`}>
                Ver plano até a prova
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Voltar ao dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const subjects = await prisma.subject.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: { questions: { where: { isPublished: true, deletedAt: null } } },
      },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo simulado</h1>
        <p className="text-muted-foreground text-sm">
          Formato Cebraspe: Certo/Errado com penalização. Cada erro anula um acerto.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <NewExamForm
            subjects={subjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
              questionCount: subject._count.questions,
            }))}
          />
        </CardContent>
      </Card>
    </main>
  );
}
