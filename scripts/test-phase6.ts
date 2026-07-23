/**
 * Teste da Fase 6 (Billing) — simula os webhooks que um provedor real
 * enviaria e valida o critério de aceite: do webhook ao acesso liberado,
 * zero passo manual. Requer o servidor rodando em BASE_URL.
 *
 * Uso: BASE_URL=http://localhost:3100 npx tsx scripts/test-phase6.ts
 */
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const WEBHOOK_URL = `${BASE_URL}/api/webhooks/checkout`;
const SECRET = process.env.CHECKOUT_WEBHOOK_SECRET!;
const TEST_EMAIL = "teste-fase2@simuladorpmma.dev";

let failures = 0;
function check(label: string, condition: boolean, detail?: string) {
  console.log(`${condition ? "✔" : "✘"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
}

async function postWebhook(body: unknown, opts: { secret?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.secret !== undefined) headers["x-webhook-secret"] = opts.secret;
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function getUser() {
  return prisma.user.findUniqueOrThrow({
    where: { email: TEST_EMAIL },
    include: { plan: true },
  });
}

async function main() {
  const user = await getUser();
  const freePlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });

  // Estado inicial limpo: usuário no free, sem compras
  await prisma.purchase.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: freePlan.id, accessExpiresAt: null },
  });

  const externalId = `tx_${randomUUID()}`;

  // 1. Segredo inválido => 401, nada muda
  const bad = await postWebhook(
    { transaction_id: externalId, status: "paid", external_reference: user.id },
    { secret: "errado" },
  );
  check("segredo inválido => 401", bad.status === 401, `status ${bad.status}`);

  // 2. Sem segredo => 401
  const noSecret = await postWebhook({
    transaction_id: externalId,
    status: "paid",
    external_reference: user.id,
  });
  check("sem segredo => 401", noSecret.status === 401, `status ${noSecret.status}`);

  const afterBad = await getUser();
  check(
    "acesso inalterado após tentativas inválidas",
    afterBad.plan?.slug === "free" && afterBad.accessExpiresAt === null,
  );

  // 3. Payload malformado (sem external_reference) => 400
  const malformed = await postWebhook(
    { transaction_id: externalId, status: "paid" },
    { secret: SECRET },
  );
  check("payload sem external_reference => 400", malformed.status === 400, `status ${malformed.status}`);

  // 4. PAID válido => 200 granted, usuário vira pago com expiração no dia da prova
  const paid = await postWebhook(
    {
      transaction_id: externalId,
      status: "paid",
      external_reference: user.id,
      email: TEST_EMAIL,
      amount_cents: 3990,
    },
    { secret: SECRET },
  );
  check("PAID => 200 granted", paid.status === 200 && paid.json?.result?.action === "granted", JSON.stringify(paid.json?.result));

  const afterPaid = await getUser();
  check("usuário no plano pago", afterPaid.plan?.slug === "ate-a-prova", afterPaid.plan?.slug);
  const expISO = afterPaid.accessExpiresAt?.toISOString();
  check(
    "accessExpiresAt = 11/10/2026 (dia da prova)",
    !!afterPaid.accessExpiresAt && new Date("2026-10-11T23:59:59-03:00").getTime() === afterPaid.accessExpiresAt.getTime(),
    expISO,
  );
  const purchase = await prisma.purchase.findUnique({ where: { externalId } });
  check("Purchase PAID registrada com paidAt", purchase?.status === "PAID" && !!purchase.paidAt);

  // 5. Webhook duplicado (mesmo PAID) => idempotente, sem efeito colateral
  const dup = await postWebhook(
    { transaction_id: externalId, status: "paid", external_reference: user.id, amount_cents: 3990 },
    { secret: SECRET },
  );
  check("PAID duplicado => 200 duplicate", dup.status === 200 && dup.json?.result?.action === "duplicate", JSON.stringify(dup.json?.result));
  const purchasesCount = await prisma.purchase.count({ where: { userId: user.id } });
  check("nenhuma Purchase extra criada (idempotência)", purchasesCount === 1, `${purchasesCount} compras`);
  const afterDup = await getUser();
  check("acesso segue pago após duplicata", afterDup.plan?.slug === "ate-a-prova");

  // 6. REFUNDED => reverte para free, limpa expiração
  const refund = await postWebhook(
    { transaction_id: externalId, status: "refunded", external_reference: user.id },
    { secret: SECRET },
  );
  check("REFUNDED => 200 revoked", refund.status === 200 && refund.json?.result?.action === "revoked", JSON.stringify(refund.json?.result));
  const afterRefund = await getUser();
  check(
    "usuário revertido para free, sem expiração",
    afterRefund.plan?.slug === "free" && afterRefund.accessExpiresAt === null,
  );
  const refundedPurchase = await prisma.purchase.findUnique({ where: { externalId } });
  check("Purchase marcada REFUNDED", refundedPurchase?.status === "REFUNDED");

  // 7. Usuário desconhecido => 200 (sem retry), sem efeito
  const unknown = await postWebhook(
    { transaction_id: `tx_${randomUUID()}`, status: "paid", external_reference: randomUUID() },
    { secret: SECRET },
  );
  check(
    "usuário desconhecido => 200 user_not_found",
    unknown.status === 200 && unknown.json?.result?.reason === "user_not_found",
    JSON.stringify(unknown.json?.result),
  );

  // limpeza: volta o usuário de teste ao free e remove compras do teste
  await prisma.purchase.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: freePlan.id, accessExpiresAt: null },
  });

  console.log(failures === 0 ? "\nTODOS OS TESTES DE BILLING PASSARAM" : `\n${failures} FALHA(S)`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
