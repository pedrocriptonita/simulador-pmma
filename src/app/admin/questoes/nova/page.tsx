import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { createQuestionAction } from "@/features/admin/questions/actions";
import { QuestionForm } from "@/features/admin/questions/components/question-form";

export const metadata: Metadata = { title: "Nova questão" };

export default async function NovaQuestaoPage() {
  const subjects = await prisma.subject.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Nova questão</h1>
      <Card>
        <CardContent className="pt-6">
          <QuestionForm
            action={createQuestionAction}
            subjects={subjects}
            submitLabel="Criar questão"
          />
        </CardContent>
      </Card>
    </main>
  );
}
