import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { updateQuestionAction } from "@/features/admin/questions/actions";
import { QuestionForm } from "@/features/admin/questions/components/question-form";

export const metadata: Metadata = { title: "Editar questão" };

export default async function EditarQuestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [question, subjects] = await Promise.all([
    prisma.question.findFirst({ where: { id, deletedAt: null } }),
    prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!question) notFound();

  const action = updateQuestionAction.bind(null, question.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Editar questão</h1>
      <Card>
        <CardContent className="pt-6">
          <QuestionForm
            action={action}
            subjects={subjects}
            submitLabel="Salvar alterações"
            defaults={{
              subjectId: question.subjectId,
              statement: question.statement,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation ?? undefined,
              difficulty: question.difficulty,
              isPublished: question.isPublished,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
