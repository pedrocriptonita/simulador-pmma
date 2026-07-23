/**
 * Auditoria de RLS (roadmap 7.2): tenta acessar dados via a API REST do
 * Supabase (PostgREST) como anônimo e como usuário comum, garantindo que
 * ninguém enxergue dados alheios. Cria dados de outro usuário (admin) e
 * confirma o isolamento. Limpa tudo ao final.
 *
 * Uso: npx tsx scripts/audit-rls.ts
 */
import { randomUUID } from "node:crypto";
import { ExamStatus, ExamType, PurchaseStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TEST_EMAIL = "teste-fase2@simuladorpmma.dev";
const TEST_PASSWORD = "TesteFase2-2026!";

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  console.log(`${condition ? "✔" : "✘"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
}

async function rest(path: string, token: string): Promise<unknown[]> {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return (await res.json()) as unknown[];
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error(`Login falhou para ${email}`);
  return json.access_token;
}

async function main() {
  const testUser = await prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL } });
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const paidPlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "ate-a-prova" } });
  const question = await prisma.question.findFirstOrThrow({
    where: { isPublished: true, deletedAt: null },
  });

  // Cria dados pertencentes ao ADMIN (o "outro usuário") para testar isolamento
  const adminExam = await prisma.exam.create({
    data: {
      userId: admin.id,
      type: ExamType.MIXED,
      status: ExamStatus.COMPLETED,
      totalQuestions: 1,
      correctCount: 1,
      wrongCount: 0,
      blankCount: 0,
      scoreNet: 1,
      answers: {
        create: [{ questionId: question.id, order: 1, userAnswer: true, isCorrect: true }],
      },
    },
    include: { answers: true },
  });
  const adminPurchase = await prisma.purchase.create({
    data: {
      userId: admin.id,
      planId: paidPlan.id,
      externalId: `audit_${randomUUID()}`,
      status: PurchaseStatus.PAID,
      amountCents: 3990,
      paidAt: new Date(),
    },
  });

  try {
    // ---- ANÔNIMO ----
    const anonUsers = await rest("users?select=id", ANON);
    check("anon NÃO lê users", anonUsers.length === 0, `${anonUsers.length} linhas`);
    const anonQuestions = await rest("questions?select=id", ANON);
    check("anon NÃO lê questions", anonQuestions.length === 0, `${anonQuestions.length}`);
    const anonExams = await rest("exams?select=id", ANON);
    check("anon NÃO lê exams", anonExams.length === 0, `${anonExams.length}`);
    const anonPurchases = await rest("purchases?select=id", ANON);
    check("anon NÃO lê purchases", anonPurchases.length === 0, `${anonPurchases.length}`);
    const anonPdfs = await rest("pdf_resources?select=id", ANON);
    check("anon NÃO lê pdf_resources", anonPdfs.length === 0, `${anonPdfs.length}`);
    const anonPlans = await rest("plans?select=slug", ANON);
    check("anon LÊ plans (catálogo)", anonPlans.length >= 2, `${anonPlans.length}`);
    const anonSubjects = await rest("subjects?select=slug", ANON);
    check("anon LÊ subjects (catálogo)", anonSubjects.length >= 8, `${anonSubjects.length}`);

    // ---- USUÁRIO COMUM ----
    const token = await login(TEST_EMAIL, TEST_PASSWORD);

    const ownUsers = (await rest("users?select=id,email", token)) as { email: string }[];
    check(
      "usuário lê SÓ a própria linha em users",
      ownUsers.length === 1 && ownUsers[0]!.email === TEST_EMAIL,
      `${ownUsers.length} linha(s)`,
    );

    const userQuestions = await rest("questions?select=id", token);
    check("usuário lê questions publicadas", userQuestions.length > 0, `${userQuestions.length}`);

    // Isolamento de exams: não vê o exam do admin
    const userExams = (await rest("exams?select=id,user_id", token)) as { user_id: string }[];
    const seesAdminExam = userExams.some((e) => e.user_id === admin.id);
    check("usuário NÃO vê exams de outro usuário", !seesAdminExam, `${userExams.length} exams`);
    const allOwn = userExams.every((e) => e.user_id === testUser.id);
    check("todos os exams visíveis são do próprio usuário", allOwn);

    // Busca direta pelo id do exam do admin => 0
    const adminExamDirect = await rest(`exams?select=id&id=eq.${adminExam.id}`, token);
    check("usuário NÃO acessa exam do admin por id", adminExamDirect.length === 0);

    // exam_answers do admin => 0
    const adminAnswersDirect = await rest(
      `exam_answers?select=id&exam_id=eq.${adminExam.id}`,
      token,
    );
    check("usuário NÃO acessa exam_answers de outro usuário", adminAnswersDirect.length === 0);

    // purchases: sem policy => ninguém lê via REST (nem as próprias)
    const userPurchases = await rest("purchases?select=id", token);
    check(
      "usuário NÃO lê purchases via REST",
      userPurchases.length === 0,
      `${userPurchases.length}`,
    );
    const adminPurchaseDirect = await rest(`purchases?select=id&id=eq.${adminPurchase.id}`, token);
    check("usuário NÃO acessa purchase de outro usuário", adminPurchaseDirect.length === 0);

    // Tentativa de UPDATE em usuário alheio (deve afetar 0 linhas)
    const patchRes = await fetch(`${URL}/rest/v1/users?id=eq.${admin.id}`, {
      method: "PATCH",
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ name: "hacked" }),
    });
    const patched = (await patchRes.json().catch(() => [])) as unknown[];
    check(
      "usuário NÃO consegue alterar outro usuário",
      Array.isArray(patched) && patched.length === 0,
      `${Array.isArray(patched) ? patched.length : "?"} alteradas`,
    );
  } finally {
    // Limpeza
    await prisma.examAnswer.deleteMany({ where: { examId: adminExam.id } });
    await prisma.exam.delete({ where: { id: adminExam.id } });
    await prisma.purchase.delete({ where: { id: adminPurchase.id } });
    // Garante que o admin não ficou com nome alterado (caso a RLS falhasse)
    await prisma.user.update({ where: { id: admin.id }, data: { name: "Admin" } });
  }

  console.log(failures === 0 ? "\nAUDITORIA RLS: TUDO OK" : `\n${failures} FALHA(S) DE RLS`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
