"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuestionDifficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth-guard";

export type QuestionFormState = { error?: string; success?: string };

const DIFFICULTIES = new Set(Object.values(QuestionDifficulty));

type ParsedQuestion = {
  subjectId: string;
  statement: string;
  correctAnswer: boolean;
  explanation: string | null;
  difficulty: QuestionDifficulty;
  isPublished: boolean;
};

function parseQuestionForm(formData: FormData): ParsedQuestion | { error: string } {
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const statement = String(formData.get("statement") ?? "").trim();
  const gabarito = String(formData.get("correctAnswer") ?? "");
  const explanation = String(formData.get("explanation") ?? "").trim();
  const difficultyRaw = String(formData.get("difficulty") ?? "MEDIO");
  const isPublished = formData.get("isPublished") === "on";

  if (!subjectId) return { error: "Escolha a matéria." };
  if (statement.length < 10) return { error: "O enunciado deve ter pelo menos 10 caracteres." };
  if (gabarito !== "CERTO" && gabarito !== "ERRADO") return { error: "Defina o gabarito." };
  const difficulty = DIFFICULTIES.has(difficultyRaw as QuestionDifficulty)
    ? (difficultyRaw as QuestionDifficulty)
    : QuestionDifficulty.MEDIO;

  return {
    subjectId,
    statement,
    correctAnswer: gabarito === "CERTO",
    explanation: explanation || null,
    difficulty,
    isPublished,
  };
}

export async function createQuestionAction(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireAdmin();

  const parsed = parseQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.subjectId, deletedAt: null },
  });
  if (!subject) return { error: "Matéria inválida." };

  await prisma.question.create({ data: parsed });
  revalidatePath("/admin/questoes");
  redirect("/admin/questoes");
}

export async function updateQuestionAction(
  questionId: string,
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireAdmin();

  const parsed = parseQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
  });
  if (!existing) return { error: "Questão não encontrada." };

  await prisma.question.update({ where: { id: questionId }, data: parsed });
  revalidatePath("/admin/questoes");
  redirect("/admin/questoes");
}

export async function togglePublishAction(questionId: string): Promise<void> {
  await requireAdmin();

  const question = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
  });
  if (!question) return;

  await prisma.question.update({
    where: { id: questionId },
    data: { isPublished: !question.isPublished },
  });
  revalidatePath("/admin/questoes");
}

export async function deleteQuestionAction(questionId: string): Promise<void> {
  await requireAdmin();

  // Soft delete: preserva histórico de simulados que usaram a questão
  await prisma.question.updateMany({
    where: { id: questionId, deletedAt: null },
    data: { deletedAt: new Date(), isPublished: false },
  });
  revalidatePath("/admin/questoes");
}

// ------------------------------------------------------------
// Importação em lote via JSON (roadmap 3.6)
// ------------------------------------------------------------

export type ImportState = { error?: string; success?: string };

type ImportRow = {
  materia?: unknown;
  enunciado?: unknown;
  gabarito?: unknown;
  explicacao?: unknown;
  dificuldade?: unknown;
};

export async function importQuestionsAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();

  const raw = String(formData.get("json") ?? "").trim();
  const publishNow = formData.get("publishNow") === "on";

  if (!raw) return { error: "Cole o JSON com as questões." };

  let rows: ImportRow[];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: "O JSON deve ser um array de questões." };
    rows = parsed;
  } catch {
    return { error: "JSON inválido. Confira a formatação." };
  }
  if (rows.length === 0) return { error: "O array está vazio." };
  if (rows.length > 500) return { error: "Máximo de 500 questões por importação." };

  const subjects = await prisma.subject.findMany({ where: { deletedAt: null } });
  const bySlug = new Map(subjects.map((subject) => [subject.slug, subject]));

  const errors: string[] = [];
  const toCreate: {
    subjectId: string;
    statement: string;
    correctAnswer: boolean;
    explanation: string | null;
    difficulty: QuestionDifficulty;
    isPublished: boolean;
  }[] = [];

  rows.forEach((row, index) => {
    const line = index + 1;
    const subject = bySlug.get(String(row.materia ?? ""));
    if (!subject) {
      errors.push(`Item ${line}: matéria "${String(row.materia ?? "")}" não existe.`);
      return;
    }
    const statement = String(row.enunciado ?? "").trim();
    if (statement.length < 10) {
      errors.push(`Item ${line}: enunciado ausente ou curto demais.`);
      return;
    }
    const gabarito = String(row.gabarito ?? "").toUpperCase();
    if (gabarito !== "CERTO" && gabarito !== "ERRADO") {
      errors.push(`Item ${line}: gabarito deve ser "CERTO" ou "ERRADO".`);
      return;
    }
    const difficultyRaw = String(row.dificuldade ?? "MEDIO").toUpperCase();
    const difficulty = DIFFICULTIES.has(difficultyRaw as QuestionDifficulty)
      ? (difficultyRaw as QuestionDifficulty)
      : QuestionDifficulty.MEDIO;

    toCreate.push({
      subjectId: subject.id,
      statement,
      correctAnswer: gabarito === "CERTO",
      explanation: String(row.explicacao ?? "").trim() || null,
      difficulty,
      isPublished: publishNow,
    });
  });

  if (errors.length > 0) {
    return { error: `Nada importado. Corrija os itens:\n${errors.slice(0, 10).join("\n")}` };
  }

  await prisma.question.createMany({ data: toCreate });
  revalidatePath("/admin/questoes");
  return {
    success: `${toCreate.length} questões importadas${publishNow ? " e publicadas" : " como rascunho"}.`,
  };
}
