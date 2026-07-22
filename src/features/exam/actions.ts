"use server";

import { redirect } from "next/navigation";
import { ExamType } from "@prisma/client";
import { requireUser } from "@/services/auth-guard";
import { createExam, finishExamForUser, saveAnswer, type SaveAnswerResult } from "@/services/exams";

export type CreateExamState = { error?: string };

export async function createExamAction(
  _prev: CreateExamState,
  formData: FormData,
): Promise<CreateExamState> {
  const authUser = await requireUser();

  const typeRaw = String(formData.get("type") ?? "");
  const type = typeRaw === "BY_SUBJECT" ? ExamType.BY_SUBJECT : ExamType.MIXED;
  const subjectId = String(formData.get("subjectId") ?? "") || null;
  const questionCount = Number(formData.get("questionCount") ?? 0);

  const result = await createExam({ userId: authUser.id, type, subjectId, questionCount });

  if (!result.ok) {
    if (result.reason === "blocked_free_limit") redirect("/planos?motivo=limite");
    if (result.reason === "blocked_expired") redirect("/planos?motivo=expirado");
    if (result.reason === "no_questions") {
      return { error: "Ainda não há questões publicadas para essa seleção. Tente outra matéria." };
    }
    return { error: "Dados inválidos. Confira a seleção e tente novamente." };
  }

  redirect(`/simulados/${result.examId}`);
}

export async function saveAnswerAction(
  examAnswerId: string,
  userAnswer: boolean | null,
): Promise<SaveAnswerResult> {
  const authUser = await requireUser();
  return saveAnswer(authUser.id, examAnswerId, userAnswer);
}

export async function finishExamAction(examId: string): Promise<void> {
  const authUser = await requireUser();
  const result = await finishExamForUser(authUser.id, examId);
  if (!result.ok) redirect("/simulados");
  redirect(`/simulados/${examId}/resultado`);
}
