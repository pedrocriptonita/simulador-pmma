import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log("banco OK:", JSON.stringify(r));
  } catch (e) {
    console.error("banco FALHOU:", (e as Error).message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
main();
