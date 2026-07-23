/**
 * Teste da Fase 4 (rodar com: npx tsx scripts/test-phase4.ts).
 * - Agregações de desempenho com exams controlados (auto-limpa).
 * - Sobe fixtures de PDF (1 free, 1 premium) e imprime os IDs para o
 *   teste HTTP do gate premium. Limpeza: scripts/cleanup-phase4.ts.
 */
import { randomUUID } from "node:crypto";
import { ExamStatus, ExamType } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma";
import { getEvolution, getPerformanceBySubject, getSummary } from "../src/services/performance";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

const TEST_EMAIL = "teste-fase2@simuladorpmma.dev";
const PDF_BUCKET = "pdfs";

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  console.log(`${condition ? "✔" : "✘"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
}

async function seedControlledExams(userId: string) {
  const portugues = await prisma.subject.findUniqueOrThrow({
    where: { slug: "lingua-portuguesa" },
  });
  const rlm = await prisma.subject.findUniqueOrThrow({ where: { slug: "raciocinio-logico" } });

  const pQuestions = await prisma.question.findMany({
    where: { subjectId: portugues.id, isPublished: true, deletedAt: null },
    take: 3,
    select: { id: true },
  });
  const rQuestions = await prisma.question.findMany({
    where: { subjectId: rlm.id, isPublished: true, deletedAt: null },
    take: 2,
    select: { id: true },
  });

  // Exam A (mais antigo): Port 2C/1E, RLM 1C/1E => correct 3, wrong 2, scoreNet +1
  // Exam B (mais novo): tudo certo nas mesmas 5 => correct 5, wrong 0, scoreNet +5
  const plans: {
    finishedAt: Date;
    scoreNet: number;
    correct: number;
    wrong: number;
    items: { questionId: string; isCorrect: boolean }[];
  }[] = [
    {
      finishedAt: new Date("2026-07-20T12:00:00-03:00"),
      scoreNet: 1,
      correct: 3,
      wrong: 2,
      items: [
        { questionId: pQuestions[0]!.id, isCorrect: true },
        { questionId: pQuestions[1]!.id, isCorrect: true },
        { questionId: pQuestions[2]!.id, isCorrect: false },
        { questionId: rQuestions[0]!.id, isCorrect: true },
        { questionId: rQuestions[1]!.id, isCorrect: false },
      ],
    },
    {
      finishedAt: new Date("2026-07-22T12:00:00-03:00"),
      scoreNet: 5,
      correct: 5,
      wrong: 0,
      items: [
        { questionId: pQuestions[0]!.id, isCorrect: true },
        { questionId: pQuestions[1]!.id, isCorrect: true },
        { questionId: pQuestions[2]!.id, isCorrect: true },
        { questionId: rQuestions[0]!.id, isCorrect: true },
        { questionId: rQuestions[1]!.id, isCorrect: true },
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.exam.create({
      data: {
        userId,
        type: ExamType.MIXED,
        status: ExamStatus.COMPLETED,
        startedAt: plan.finishedAt,
        finishedAt: plan.finishedAt,
        durationSeconds: 900,
        totalQuestions: plan.items.length,
        correctCount: plan.correct,
        wrongCount: plan.wrong,
        blankCount: plan.items.length - plan.correct - plan.wrong,
        scoreNet: plan.scoreNet,
        answers: {
          create: plan.items.map((item, index) => ({
            questionId: item.questionId,
            order: index + 1,
            userAnswer: true,
            isCorrect: item.isCorrect,
            answeredAt: plan.finishedAt,
          })),
        },
      },
    });
  }
}

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL } });
  const free = await prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });

  // --- Agregações de desempenho ---
  await prisma.examAnswer.deleteMany({ where: { exam: { userId: user.id } } });
  await prisma.exam.deleteMany({ where: { userId: user.id } });
  await seedControlledExams(user.id);

  const summary = await getSummary(user.id);
  check("summary.totalExams = 2", summary.totalExams === 2, String(summary.totalExams));
  check("summary.totalAnswered = 10", summary.totalAnswered === 10, String(summary.totalAnswered));
  check(
    "summary.averageScoreNet = 3",
    summary.averageScoreNet === 3,
    String(summary.averageScoreNet),
  );
  check("summary.bestScoreNet = 5", summary.bestScoreNet === 5, String(summary.bestScoreNet));
  check("summary.lastScoreNet = 5", summary.lastScoreNet === 5, String(summary.lastScoreNet));

  const evolution = await getEvolution(user.id);
  check(
    "evolution cronológica [+1, +5]",
    evolution.length === 2 && evolution[0]!.scoreNet === 1 && evolution[1]!.scoreNet === 5,
    evolution.map((e) => e.scoreNet).join(", "),
  );

  const perf = await getPerformanceBySubject(user.id);
  const port = perf.find((p) => p.subjectName === "Língua Portuguesa");
  const rlm = perf.find((p) => p.subjectName === "Raciocínio Lógico");
  check(
    "Português: 5C/1E => 83%",
    !!port && port.correct === 5 && port.wrong === 1 && port.accuracy === 83,
    port ? `${port.correct}C/${port.wrong}E ${port.accuracy}%` : "ausente",
  );
  check(
    "RLM: 3C/1E => 75%",
    !!rlm && rlm.correct === 3 && rlm.wrong === 1 && rlm.accuracy === 75,
    rlm ? `${rlm.correct}C/${rlm.wrong}E ${rlm.accuracy}%` : "ausente",
  );

  // --- Fixtures de PDF ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // limpa fixtures anteriores
  const oldFixtures = await prisma.pdfResource.findMany({
    where: { title: { startsWith: "[TESTE]" } },
  });
  for (const old of oldFixtures) {
    await supabase.storage.from(PDF_BUCKET).remove([old.storagePath]);
  }
  await prisma.pdfResource.deleteMany({ where: { title: { startsWith: "[TESTE]" } } });

  const dummyPdf = Buffer.from("%PDF-1.4\n% teste fase 4\n", "utf8");
  const freePath = `test/free-${randomUUID()}.pdf`;
  const premiumPath = `test/premium-${randomUUID()}.pdf`;
  const up1 = await supabase.storage
    .from(PDF_BUCKET)
    .upload(freePath, dummyPdf, { contentType: "application/pdf" });
  const up2 = await supabase.storage
    .from(PDF_BUCKET)
    .upload(premiumPath, dummyPdf, { contentType: "application/pdf" });
  check("upload PDF free no bucket", !up1.error, up1.error?.message);
  check("upload PDF premium no bucket", !up2.error, up2.error?.message);

  const freePdf = await prisma.pdfResource.create({
    data: {
      title: "[TESTE] Resumo grátis",
      subjectId: null,
      storagePath: freePath,
      isPremium: false,
      isPublished: true,
    },
  });
  const premiumPdf = await prisma.pdfResource.create({
    data: {
      title: "[TESTE] Resumo premium",
      subjectId: null,
      storagePath: premiumPath,
      isPremium: true,
      isPublished: true,
    },
  });

  // signed URL gerada corretamente para path existente
  const signed = await supabase.storage.from(PDF_BUCKET).createSignedUrl(freePath, 60);
  check("signed URL gerada p/ arquivo real", !!signed.data?.signedUrl, signed.error?.message);

  console.log(`\nPDF_FREE=${freePdf.id}`);
  console.log(`PDF_PREMIUM=${premiumPdf.id}`);

  // garante que o usuário de teste está no free (para o teste HTTP do gate)
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: free.id, accessExpiresAt: null },
  });

  console.log(failures === 0 ? "\nPERF/PDF SETUP OK" : `\n${failures} FALHA(S)`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
