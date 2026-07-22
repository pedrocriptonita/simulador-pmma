import type { Metadata } from "next";
import Link from "next/link";
import { QuestionDifficulty, type Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import {
  PublishSwitch,
  RowActions,
} from "@/features/admin/questions/components/question-row-actions";
import { QuestionsFilters } from "@/features/admin/questions/components/questions-filters";

export const metadata: Metadata = { title: "Questões" };

const DIFFICULTY_LABEL: Record<string, string> = {
  FACIL: "Fácil",
  MEDIO: "Médio",
  DIFICIL: "Difícil",
};

export default async function QuestoesPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string; status?: string; dificuldade?: string }>;
}) {
  const { materia, status, dificuldade } = await searchParams;

  const where: Prisma.QuestionWhereInput = { deletedAt: null };
  if (materia) where.subject = { slug: materia };
  if (status === "publicadas") where.isPublished = true;
  if (status === "rascunhos") where.isPublished = false;
  if (dificuldade && dificuldade in DIFFICULTY_LABEL) {
    where.difficulty = dificuldade as QuestionDifficulty;
  }

  const [questions, total, published, subjects] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { subject: { select: { name: true } } },
    }),
    prisma.question.count({ where: { deletedAt: null } }),
    prisma.question.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questões</h1>
          <p className="text-muted-foreground text-sm">
            {total} no banco · {published} publicadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/questoes/importar">Importar JSON</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/questoes/nova">Nova questão</Link>
          </Button>
        </div>
      </div>

      <QuestionsFilters subjects={subjects} />

      <Card>
        <CardContent className="pt-6">
          {questions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhuma questão encontrada com esses filtros.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Enunciado</TableHead>
                    <TableHead>Matéria</TableHead>
                    <TableHead>Gabarito</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Publicada</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-[400px]">
                        <p className="line-clamp-2 text-sm whitespace-normal">
                          {question.statement}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{question.subject.name}</TableCell>
                      <TableCell>
                        <Badge variant={question.correctAnswer ? "default" : "destructive"}>
                          {question.correctAnswer ? "CERTO" : "ERRADO"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {DIFFICULTY_LABEL[question.difficulty]}
                      </TableCell>
                      <TableCell>
                        <PublishSwitch
                          questionId={question.id}
                          isPublished={question.isPublished}
                        />
                      </TableCell>
                      <TableCell>
                        <RowActions questionId={question.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
