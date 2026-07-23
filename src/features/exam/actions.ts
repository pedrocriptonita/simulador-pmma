"use server";

import { redirect } from "next/navigation";
import { ExamType } from "@prisma/client";
import { z } from "zod";
import { formatRetryAfter, getClientIp, rateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/services/auth-guard";
import { createExam, finishExamForUser, saveAnswer, type SaveAnswerResult } from "@/services/exams";

export type CreateExamState = { error?: string };

const createExamSchema = z.object({
  type: z.enum(["MIXED", "BY_SUBJECT"]),
  subjectId: z.uuid().nullable(),
  questionCount: z.coerce
    .number()
    .int()
    .refine((n) => [10, 15, 20, 30].includes(n), {
      message: "Quantidade inválida.",
    }),
});

export async function createExamAction(
  _prev: CreateExamState,
  formData: FormData,
): Promise<CreateExamState> {
  const authUser = await requireUser();

  // Geração de simulado é pesada no banco — limita rajadas por IP.
  const ip = await getClientIp();
  const limit = rateLimit(`exam-create:${ip}`, 12, 10 * 60_000);
  if (!limit.ok) {
    return {
      error: `Muitas tentativas. Aguarde ${formatRetryAfter(limit.retryAfterSeconds)}.`,
    };
  }

  const parsed = createExamSchema.safeParse({
    type: formData.get("type"),
    subjectId: formData.get("subjectId") || null,
    questionCount: formData.get("questionCount"),
  });
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira a seleção e tente novamente." };
  }
  if (parsed.data.type === "BY_SUBJECT" && !parsed.data.subjectId) {
    return { error: "Escolha a matéria do simulado." };
  }

  const result = await createExam({
    userId: authUser.id,
    type: parsed.data.type === "BY_SUBJECT" ? ExamType.BY_SUBJECT : ExamType.MIXED,
    subjectId: parsed.data.subjectId,
    questionCount: parsed.data.questionCount,
  });

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
