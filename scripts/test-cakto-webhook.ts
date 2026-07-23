/**
 * Testa o adapter da Cakto (segredo no corpo, identificação por e-mail,
 * amount em reais). Requer o servidor rodando com PAYMENT_PROVIDER=cakto
 * e CHECKOUT_WEBHOOK_SECRET definido.
 *
 * Uso: BASE_URL=http://localhost:3100 npx tsx scripts/test-cakto-webhook.ts
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

function caktoEvent(event: string, overrides: Record<string, unknown> = {}, secret = SECRET) {
  return {
    event,
    secret,
    data: {
      id: overrides.id ?? `cakto_${randomUUID()}`,
      status: "paid",
      amount: 39.9,
      customer: { email: TEST_EMAIL },
      ...overrides,
    },
  };
}

async function post(body: unknown) {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function getUser() {
  return prisma.user.findUniqueOrThrow({ where: { email: TEST_EMAIL }, include: { plan: true } });
}

async function main() {
  const user = await getUser();
  const freePlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });

  await prisma.purchase.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: freePlan.id, accessExpiresAt: null },
  });

  // 1. Segredo errado (no corpo) => 401
  const bad = await post(caktoEvent("purchase_approved", {}, "segredo-errado"));
  check("secret errado no corpo => 401", bad.status === 401, `status ${bad.status}`);

  // 2. Evento irrelevante (pix_gerado) => 200 ignorado, sem tocar no acesso
  const ignored = await post(caktoEvent("pix_gerado"));
  check(
    "evento pix_gerado => 200 ignorado",
    ignored.status === 200 && ignored.json?.result?.ignored === true,
    JSON.stringify(ignored.json?.result),
  );

  // 3. E-mail desconhecido => 200 user_not_found, sem criar nada
  const unknownEmail = await post(
    caktoEvent("purchase_approved", { customer: { email: "ninguem-com-esse-email@example.com" } }),
  );
  check(
    "e-mail desconhecido => 200 user_not_found",
    unknownEmail.status === 200 && unknownEmail.json?.result?.reason === "user_not_found",
    JSON.stringify(unknownEmail.json?.result),
  );

  // 4. purchase_approved válido => acesso liberado, amount 39.9 reais => 3990 centavos
  const txId = `cakto_${randomUUID()}`;
  const approved = await post(caktoEvent("purchase_approved", { id: txId }));
  check(
    "purchase_approved => 200 granted",
    approved.status === 200 && approved.json?.result?.action === "granted",
    JSON.stringify(approved.json?.result),
  );

  const afterPaid = await getUser();
  check("usuário no plano pago", afterPaid.plan?.slug === "ate-a-prova", afterPaid.plan?.slug);
  const purchase = await prisma.purchase.findUnique({ where: { externalId: txId } });
  check(
    "amount 39.9 reais convertido para 3990 centavos",
    purchase?.amountCents === 3990,
    String(purchase?.amountCents),
  );

  // 5. Duplicado => idempotente
  const dup = await post(caktoEvent("purchase_approved", { id: txId }));
  check(
    "purchase_approved duplicado => 200 duplicate",
    dup.status === 200 && dup.json?.result?.action === "duplicate",
    JSON.stringify(dup.json?.result),
  );

  // 6. Chargeback => reverte para free
  const chargeback = await post(caktoEvent("chargeback", { id: txId }));
  check(
    "chargeback => 200 revoked",
    chargeback.status === 200 && chargeback.json?.result?.action === "revoked",
    JSON.stringify(chargeback.json?.result),
  );
  const afterChargeback = await getUser();
  check(
    "usuário revertido para free após chargeback",
    afterChargeback.plan?.slug === "free" && afterChargeback.accessExpiresAt === null,
  );

  // limpeza
  await prisma.purchase.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { planId: freePlan.id, accessExpiresAt: null },
  });

  console.log(
    failures === 0 ? "\nTODOS OS TESTES DO ADAPTER CAKTO PASSARAM" : `\n${failures} FALHA(S)`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
