import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const [totalUsers, totalSubjects, totalQuestions] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subject.count({ where: { deletedAt: null } }),
    prisma.question.count({ where: { deletedAt: null } }),
  ]);

  const stats = [
    { label: "Usuários", value: totalUsers },
    { label: "Matérias", value: totalSubjects },
    { label: "Questões", value: totalQuestions },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Banco de questões</CardTitle>
          <CardDescription>
            Cadastre, edite, publique e importe questões em lote para os simulados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/questoes">Gerenciar questões</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/questoes/importar">Importar JSON</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biblioteca de materiais</CardTitle>
          <CardDescription>
            Envie PDFs de resumo, defina matéria e controle acesso premium/publicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/materiais">Gerenciar materiais</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
