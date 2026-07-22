import { ExamStatus, ExamType, type Exam } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkAccess } from "./access";

/** 3 min por questão (padrão do roadmap, 3.2). */
export const SECONDS_PER_QUESTION = 180;
export const QUESTION_COUNT_OPTIONS = [10, 15, 20, 30] as const;

/** Simulado expirado há mais de isso e sem nenhuma resposta => ABANDONED. */
const ABANDON_AFTER_MS = 6 * 60 * 60 * 1000;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function expiresAtOf(exam: Pick<Exam, "startedAt" | "durationSeconds">): number | null {
  if (exam.durationSeconds == null) return null;
  return exam.startedAt.getTime() + exam.durationSeconds * 1000;
}

export function isExpired(exam: Pick<Exam, "startedAt" | "durationSeconds">): boolean {
  const expiresAt = expiresAtOf(exam);
  return expiresAt !== null && expiresAt <= Date.now();
}

// ------------------------------------------------------------
// Geração (roadmap 3.2)
// ------------------------------------------------------------

export type CreateExamResult =
  | { ok: true; examId: string }
  | {
      ok: false;
      reason: "blocked_free_limit" | "blocked_expired" | "no_questions" | "invalid_input";
    };

/** Distribui as vagas do simulado misto proporcionalmente ao peso das matérias. */
async function pickMixedQuestionIds(
  pool: { id: string; subjectId: string }[],
  count: number,
): Promise<string[]> {
  const bySubject = new Map<string, string[]>();
  for (const question of pool) {
    const list = bySubject.get(question.subjectId) ?? [];
    list.push(question.id);
    bySubject.set(question.subjectId, list);
  }

  const subjects = await prisma.subject.findMany({
    where: { id: { in: [...bySubject.keys()] } },
    select: { id: true, weight: true },
  });
  const totalWeight = subjects.reduce((sum, s) => sum + Math.max(1, s.weight), 0);

  // Alocação proporcional (parte inteira + maiores frações)
  const allocations = subjects.map((s) => {
    const exact = (count * Math.max(1, s.weight)) / totalWeight;
    return { subjectId: s.id, base: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  let remaining = count - allocations.reduce((sum, a) => sum + a.base, 0);
  allocations.sort((a, b) => b.fraction - a.fraction);
  for (const allocation of allocations) {
    if (remaining <= 0) break;
    allocation.base += 1;
    remaining -= 1;
  }

  const selected: string[] = [];
  const leftovers: string[] = [];
  for (const allocation of allocations) {
    const ids = shuffle(bySubject.get(allocation.subjectId) ?? []);
    selected.push(...ids.slice(0, allocation.base));
    leftovers.push(...ids.slice(allocation.base));
  }

  // Matérias sem questões suficientes: completa com o restante do banco
  if (selected.length < count) {
    selected.push(...shuffle(leftovers).slice(0, count - selected.length));
  }

  return shuffle(selected).slice(0, count);
}

export async function createExam(params: {
  userId: string;
  type: ExamType;
  subjectId?: string | null;
  questionCount: number;
}): Promise<CreateExamResult> {
  const { userId, type, subjectId, questionCount } = params;

  if (!QUESTION_COUNT_OPTIONS.includes(questionCount as 10 | 15 | 20 | 30)) {
    return { ok: false, reason: "invalid_input" };
  }
  if (type === ExamType.BY_SUBJECT && !subjectId) {
    return { ok: false, reason: "invalid_input" };
  }

  const access = await checkAccess(userId);
  if (access.status !== "allowed") {
    return { ok: false, reason: access.status };
  }

  const pool = await prisma.question.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      ...(type === ExamType.BY_SUBJECT ? { subjectId: subjectId! } : {}),
    },
    select: { id: true, subjectId: true },
  });
  if (pool.length === 0) {
    return { ok: false, reason: "no_questions" };
  }

  const selectedIds =
    type === ExamType.BY_SUBJECT
      ? shuffle(pool)
          .slice(0, Math.min(questionCount, pool.length))
          .map((q) => q.id)
      : await pickMixedQuestionIds(pool, Math.min(questionCount, pool.length));

  let title = "Simulado misto";
  if (type === ExamType.BY_SUBJECT && subjectId) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    title = `Simulado — ${subject?.name ?? "matéria"}`;
  }

  const exam = await prisma.exam.create({
    data: {
      userId,
      type,
      subjectId: type === ExamType.BY_SUBJECT ? subjectId : null,
      title,
      durationSeconds: selectedIds.length * SECONDS_PER_QUESTION,
      answers: {
        create: selectedIds.map((questionId, index) => ({ questionId, order: index + 1 })),
      },
    },
  });

  return { ok: true, examId: exam.id };
}

// ------------------------------------------------------------
// Execução (roadmap 3.4)
// ------------------------------------------------------------

export type SaveAnswerResult =
  { ok: true } | { ok: false; reason: "not_found" | "finished" | "expired" };

export async function saveAnswer(
  userId: string,
  examAnswerId: string,
  userAnswer: boolean | null,
): Promise<SaveAnswerResult> {
  const answer = await prisma.examAnswer.findUnique({
    where: { id: examAnswerId },
    include: { exam: true },
  });
  if (!answer || answer.exam.userId !== userId) {
    return { ok: false, reason: "not_found" };
  }
  if (answer.exam.status !== ExamStatus.IN_PROGRESS) {
    return { ok: false, reason: "finished" };
  }
  if (isExpired(answer.exam)) {
    await finalizeExam(answer.exam.id);
    return { ok: false, reason: "expired" };
  }

  await prisma.examAnswer.update({
    where: { id: examAnswerId },
    data: { userAnswer, answeredAt: userAnswer === null ? null : new Date() },
  });
  return { ok: true };
}

/**
 * Correção Cebraspe (roadmap 3.4): nota líquida = acertos − erros.
 * Idempotente: só corrige simulados IN_PROGRESS.
 * Expirado há mais de ABANDON_AFTER_MS sem nenhuma resposta => ABANDONED.
 */
export async function finalizeExam(examId: string): Promise<void> {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      answers: { include: { question: { select: { correctAnswer: true } } } },
    },
  });
  if (!exam || exam.status !== ExamStatus.IN_PROGRESS) return;

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;
  const itemUpdates = [];

  for (const answer of exam.answers) {
    if (answer.userAnswer === null) {
      blankCount += 1;
      continue;
    }
    const isCorrect = answer.userAnswer === answer.question.correctAnswer;
    if (isCorrect) correctCount += 1;
    else wrongCount += 1;
    itemUpdates.push(prisma.examAnswer.update({ where: { id: answer.id }, data: { isCorrect } }));
  }

  const expiresAt = expiresAtOf(exam);
  const abandoned =
    blankCount === exam.answers.length &&
    expiresAt !== null &&
    Date.now() - expiresAt > ABANDON_AFTER_MS;

  await prisma.$transaction([
    ...itemUpdates,
    prisma.exam.update({
      where: { id: examId },
      data: {
        status: abandoned ? ExamStatus.ABANDONED : ExamStatus.COMPLETED,
        finishedAt: new Date(),
        totalQuestions: exam.answers.length,
        correctCount,
        wrongCount,
        blankCount,
        scoreNet: correctCount - wrongCount,
      },
    }),
  ]);
}

export type FinishExamResult = { ok: true } | { ok: false; reason: "not_found" };

export async function finishExamForUser(userId: string, examId: string): Promise<FinishExamResult> {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.userId !== userId) {
    return { ok: false, reason: "not_found" };
  }
  await finalizeExam(examId);
  return { ok: true };
}

// ------------------------------------------------------------
// Leituras (runner, resultado, histórico)
// ------------------------------------------------------------

/** Dados do simulado em andamento, SEM gabarito (não vaza para o client). */
export async function getExamForRunner(userId: string, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      answers: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          userAnswer: true,
          question: { select: { statement: true, subject: { select: { name: true } } } },
        },
      },
    },
  });
  if (!exam || exam.userId !== userId) return null;

  if (exam.status === ExamStatus.IN_PROGRESS && isExpired(exam)) {
    await finalizeExam(exam.id);
    return { finished: true as const, examId: exam.id };
  }
  if (exam.status !== ExamStatus.IN_PROGRESS) {
    return { finished: true as const, examId: exam.id };
  }

  return {
    finished: false as const,
    examId: exam.id,
    title: exam.title ?? "Simulado",
    endsAt: expiresAtOf(exam),
    items: exam.answers.map((answer) => ({
      examAnswerId: answer.id,
      order: answer.order,
      statement: answer.question.statement,
      subjectName: answer.question.subject.name,
      userAnswer: answer.userAnswer,
    })),
  };
}

/** Resultado corrigido, com gabarito comentado. Null se não pertence ao usuário. */
export async function getExamResult(userId: string, examId: string) {
  let exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.userId !== userId) return null;

  if (exam.status === ExamStatus.IN_PROGRESS) {
    if (!isExpired(exam)) return { inProgress: true as const, examId };
    await finalizeExam(examId);
    exam = (await prisma.exam.findUnique({ where: { id: examId } }))!;
  }

  const answers = await prisma.examAnswer.findMany({
    where: { examId },
    orderBy: { order: "asc" },
    include: {
      question: {
        select: {
          statement: true,
          correctAnswer: true,
          explanation: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  return { inProgress: false as const, exam, answers };
}

/** Histórico do usuário; finaliza preguiçosamente os expirados. */
export async function listUserExams(userId: string) {
  const inProgress = await prisma.exam.findMany({
    where: { userId, status: ExamStatus.IN_PROGRESS },
  });
  for (const exam of inProgress) {
    if (isExpired(exam)) await finalizeExam(exam.id);
  }

  return prisma.exam.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { subject: { select: { name: true } } },
  });
}
