import { ExamStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SubjectPerformance = {
  subjectId: string;
  subjectName: string;
  answered: number; // itens respondidos (exclui em branco)
  correct: number;
  wrong: number;
  accuracy: number; // % de acerto sobre os respondidos (0–100)
};

export type EvolutionPoint = {
  examId: string;
  date: Date;
  label: string;
  scoreNet: number;
  totalQuestions: number;
};

export type PerformanceSummary = {
  totalExams: number;
  totalAnswered: number;
  averageScoreNet: number | null;
  lastScoreNet: number | null;
  bestScoreNet: number | null;
  /**
   * Aproveitamento líquido médio, em % (pode ser negativo).
   *
   * A nota líquida absoluta não diz se o desempenho é bom: +12 é ótimo num
   * simulado de 15 itens e fraco num de 30. Só com o percentual dá para
   * atribuir um juízo — e, portanto, uma cor.
   */
  averageNetPercent: number | null;
  /** Aproveitamento líquido do último simulado, em %. */
  lastNetPercent: number | null;
};

/**
 * % de acerto e contagens por matéria, agregando os itens corrigidos
 * dos simulados COMPLETED do usuário. Considera apenas itens respondidos
 * (em branco não entra no denominador de acurácia).
 */
export async function getPerformanceBySubject(userId: string): Promise<SubjectPerformance[]> {
  const answers = await prisma.examAnswer.findMany({
    where: {
      exam: { userId, status: ExamStatus.COMPLETED },
      userAnswer: { not: null },
    },
    select: {
      isCorrect: true,
      question: { select: { subject: { select: { id: true, name: true, order: true } } } },
    },
  });

  const bySubject = new Map<
    string,
    { name: string; order: number; correct: number; wrong: number }
  >();

  for (const answer of answers) {
    const subject = answer.question.subject;
    const entry = bySubject.get(subject.id) ?? {
      name: subject.name,
      order: subject.order,
      correct: 0,
      wrong: 0,
    };
    if (answer.isCorrect) entry.correct += 1;
    else entry.wrong += 1;
    bySubject.set(subject.id, entry);
  }

  return [...bySubject.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([subjectId, entry]) => {
      const answered = entry.correct + entry.wrong;
      return {
        subjectId,
        subjectName: entry.name,
        answered,
        correct: entry.correct,
        wrong: entry.wrong,
        accuracy: answered === 0 ? 0 : Math.round((entry.correct / answered) * 100),
      };
    });
}

/** Nota líquida por simulado ao longo do tempo (ordem cronológica). */
export async function getEvolution(userId: string): Promise<EvolutionPoint[]> {
  const exams = await prisma.exam.findMany({
    where: { userId, status: ExamStatus.COMPLETED },
    orderBy: { finishedAt: "asc" },
    select: {
      id: true,
      finishedAt: true,
      createdAt: true,
      scoreNet: true,
      totalQuestions: true,
    },
  });

  return exams.map((exam, index) => {
    const date = exam.finishedAt ?? exam.createdAt;
    return {
      examId: exam.id,
      date,
      label: `#${index + 1}`,
      scoreNet: exam.scoreNet ?? 0,
      totalQuestions: exam.totalQuestions ?? 0,
    };
  });
}

/** Resumo geral: total de simulados, questões respondidas, média/última/melhor nota. */
export async function getSummary(userId: string): Promise<PerformanceSummary> {
  const exams = await prisma.exam.findMany({
    where: { userId, status: ExamStatus.COMPLETED },
    orderBy: { finishedAt: "asc" },
    select: {
      scoreNet: true,
      correctCount: true,
      wrongCount: true,
      totalQuestions: true,
      finishedAt: true,
    },
  });

  if (exams.length === 0) {
    return {
      totalExams: 0,
      totalAnswered: 0,
      averageScoreNet: null,
      lastScoreNet: null,
      bestScoreNet: null,
      averageNetPercent: null,
      lastNetPercent: null,
    };
  }

  const scores = exams.map((exam) => exam.scoreNet ?? 0);
  const totalAnswered = exams.reduce(
    (sum, exam) => sum + (exam.correctCount ?? 0) + (exam.wrongCount ?? 0),
    0,
  );
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Percentual ponderado pelo total de itens, não a média das médias: um
  // simulado de 30 questões deve pesar o dobro de um de 15.
  const totalQuestions = exams.reduce((sum, exam) => sum + (exam.totalQuestions ?? 0), 0);
  const totalNet = scores.reduce((sum, score) => sum + score, 0);

  const last = exams[exams.length - 1]!;
  const lastTotal = last.totalQuestions ?? 0;

  return {
    totalExams: exams.length,
    totalAnswered,
    averageScoreNet: Math.round(average * 10) / 10,
    lastScoreNet: scores[scores.length - 1]!,
    bestScoreNet: Math.max(...scores),
    averageNetPercent: totalQuestions > 0 ? Math.round((totalNet / totalQuestions) * 100) : null,
    lastNetPercent: lastTotal > 0 ? Math.round(((last.scoreNet ?? 0) / lastTotal) * 100) : null,
  };
}
