/**
 * Teste funcional da Fase 3 (rodar com: npx tsx scripts/test-phase3.ts).
 * Usa o usuário de teste e o admin criados nas fases anteriores.
 */
import { prisma } from "../src/lib/prisma";
import { checkAccess } from "../src/services/access";
import { createExam, finishExamForUser, saveAnswer } from "../src/services/exams";

const TEST_EMAIL = "teste-fase2@simuladorpmma.dev";

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  const mark = condition ? "✔" : "✘";
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!user || !admin) throw new Error("Usuários de teste não encontrados.");

  // Limpa simulados anteriores do usuário de teste e do admin (idempotência)
  await prisma.examAnswer.deleteMany({ where: { exam: { userId: { in: [user.id, admin.id] } } } });
  await prisma.exam.deleteMany({ where: { userId: { in: [user.id, admin.id] } } });

  // 1. Free: primeiro simulado da semana liberado
  const access1 = await checkAccess(user.id);
  check("free com 0 simulados na semana => allowed", access1.status === "allowed");

  // 2. Criação de simulado misto de 10 questões
  const created = await createExam({ userId: user.id, type: "MIXED", questionCount: 10 });
  check("createExam misto => ok", created.ok);
  if (!created.ok) throw new Error("abortando");
  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: created.examId },
    include: { answers: true },
  });
  check(
    "10 itens criados com userAnswer nulo",
    exam.answers.length === 10 && exam.answers.every((a) => a.userAnswer === null),
  );
  check("durationSeconds = 10 × 180", exam.durationSeconds === 1800);
  check("status IN_PROGRESS", exam.status === "IN_PROGRESS");

  // 3. Free: segundo simulado na mesma semana bloqueado
  const access2 = await checkAccess(user.id);
  check(
    "free com 1 simulado na semana => blocked_free_limit",
    access2.status === "blocked_free_limit",
  );
  const blocked = await createExam({ userId: user.id, type: "MIXED", questionCount: 10 });
  check("createExam bloqueado", !blocked.ok && blocked.reason === "blocked_free_limit");

  // 4. Responde: 6 certas, 2 erradas, 2 em branco
  const answers = await prisma.examAnswer.findMany({
    where: { examId: exam.id },
    orderBy: { order: "asc" },
    include: { question: { select: { correctAnswer: true } } },
  });
  for (let i = 0; i < 6; i++) {
    const r = await saveAnswer(user.id, answers[i]!.id, answers[i]!.question.correctAnswer);
    if (!r.ok) check(`saveAnswer certa #${i + 1}`, false, r.reason);
  }
  for (let i = 6; i < 8; i++) {
    const r = await saveAnswer(user.id, answers[i]!.id, !answers[i]!.question.correctAnswer);
    if (!r.ok) check(`saveAnswer errada #${i + 1}`, false, r.reason);
  }
  // segurança: outro usuário não consegue responder
  const foreign = await saveAnswer(admin.id, answers[0]!.id, true);
  check("saveAnswer de outro usuário => not_found", !foreign.ok && foreign.reason === "not_found");

  // 5. Finaliza e confere correção Cebraspe
  const finished = await finishExamForUser(user.id, exam.id);
  check("finishExam => ok", finished.ok);
  const corrected = await prisma.exam.findUniqueOrThrow({ where: { id: exam.id } });
  check("correctCount = 6", corrected.correctCount === 6, String(corrected.correctCount));
  check("wrongCount = 2", corrected.wrongCount === 2, String(corrected.wrongCount));
  check("blankCount = 2", corrected.blankCount === 2, String(corrected.blankCount));
  check("NOTA LÍQUIDA = 6 − 2 = 4", corrected.scoreNet === 4, String(corrected.scoreNet));
  check(
    "status COMPLETED + finishedAt",
    corrected.status === "COMPLETED" && !!corrected.finishedAt,
  );

  // 6. finishExam idempotente (não recorrige)
  await finishExamForUser(user.id, exam.id);
  const again = await prisma.exam.findUniqueOrThrow({ where: { id: exam.id } });
  check("finalização idempotente", again.scoreNet === 4 && again.status === "COMPLETED");

  // 7. Admin: sempre liberado + simulado por matéria
  const adminAccess = await checkAccess(admin.id);
  check("admin => allowed (sem limite)", adminAccess.status === "allowed");
  const portugues = await prisma.subject.findUniqueOrThrow({
    where: { slug: "lingua-portuguesa" },
  });
  const bySubject = await createExam({
    userId: admin.id,
    type: "BY_SUBJECT",
    subjectId: portugues.id,
    questionCount: 10,
  });
  check("createExam por matéria => ok", bySubject.ok);
  if (bySubject.ok) {
    const subjectExam = await prisma.examAnswer.findMany({
      where: { examId: bySubject.examId },
      include: { question: { select: { subjectId: true } } },
    });
    check(
      "todas as questões são da matéria escolhida",
      subjectExam.every((a) => a.question.subjectId === portugues.id),
    );
  }

  // 8. Distribuição por peso no misto (30 questões)
  const mixed = await createExam({ userId: admin.id, type: "MIXED", questionCount: 30 });
  check("createExam misto 30 => ok", mixed.ok);
  if (mixed.ok) {
    const items = await prisma.examAnswer.findMany({
      where: { examId: mixed.examId },
      include: { question: { include: { subject: { select: { name: true, weight: true } } } } },
    });
    const bySubjectCount = new Map<string, number>();
    for (const item of items) {
      const name = item.question.subject.name;
      bySubjectCount.set(name, (bySubjectCount.get(name) ?? 0) + 1);
    }
    console.log("  distribuição:", Object.fromEntries(bySubjectCount));
    check("misto tem 30 questões", items.length === 30);
    const legisl = bySubjectCount.get("Legislação Institucional") ?? 0;
    check("Legislação (peso 70) domina o misto", legisl >= 10, `${legisl} questões`);
  }

  // 9. Plano pago: vigente libera, expirado bloqueia
  const paid = await prisma.plan.findUniqueOrThrow({ where: { slug: "ate-a-prova" } });
  const free = await prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: paid.id, accessExpiresAt: new Date("2026-10-11T23:59:59-03:00") },
  });
  const paidAccess = await checkAccess(user.id);
  check("pago vigente => allowed (ignora limite semanal)", paidAccess.status === "allowed");
  await prisma.user.update({
    where: { id: user.id },
    data: { accessExpiresAt: new Date("2026-01-01T00:00:00-03:00") },
  });
  const expiredAccess = await checkAccess(user.id);
  check("pago expirado => blocked_expired", expiredAccess.status === "blocked_expired");

  // restaura o usuário de teste para free
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: free.id, accessExpiresAt: null },
  });

  // limpa os exams do admin criados neste teste
  await prisma.examAnswer.deleteMany({ where: { exam: { userId: admin.id } } });
  await prisma.exam.deleteMany({ where: { userId: admin.id } });

  console.log(failures === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${failures} FALHA(S)`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
