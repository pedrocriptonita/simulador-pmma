/** Alterna o plano do usuário de teste: npx tsx scripts/set-plan.ts paid|free */
import { prisma } from "../src/lib/prisma";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* ambiente atual */
}

const TEST_EMAIL = "teste-fase2@simuladorpmma.dev";

async function main() {
  const mode = process.argv[2] === "paid" ? "paid" : "free";
  const slug = mode === "paid" ? "ate-a-prova" : "free";
  const plan = await prisma.plan.findUniqueOrThrow({ where: { slug } });
  await prisma.user.update({
    where: { email: TEST_EMAIL },
    data: {
      planId: plan.id,
      accessExpiresAt: mode === "paid" ? new Date("2026-10-11T23:59:59-03:00") : null,
    },
  });
  console.log(`✔ ${TEST_EMAIL} => ${slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
