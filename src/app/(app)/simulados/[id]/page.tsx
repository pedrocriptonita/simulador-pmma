import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/services/auth-guard";
import { getExamForRunner } from "@/services/exams";
import { ExamRunner } from "@/features/exam/components/exam-runner";

export const metadata: Metadata = { title: "Simulado em andamento" };

export default async function SimuladoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const exam = await getExamForRunner(authUser.id, id);
  if (!exam) notFound();
  if (exam.finished) redirect(`/simulados/${exam.examId}/resultado`);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      <ExamRunner examId={exam.examId} title={exam.title} endsAt={exam.endsAt} items={exam.items} />
    </main>
  );
}
