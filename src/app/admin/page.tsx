import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>

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
          <CardTitle className="text-base">CRUD de questões</CardTitle>
          <CardDescription>Chega na Fase 3, junto com os simulados.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
