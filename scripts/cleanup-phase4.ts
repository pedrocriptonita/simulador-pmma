/** Remove os fixtures de PDF do teste da Fase 4. */
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

const PDF_BUCKET = "pdfs";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const fixtures = await prisma.pdfResource.findMany({
    where: { title: { startsWith: "[TESTE]" } },
  });
  for (const fixture of fixtures) {
    await supabase.storage.from(PDF_BUCKET).remove([fixture.storagePath]);
  }
  await prisma.pdfResource.deleteMany({ where: { title: { startsWith: "[TESTE]" } } });
  console.log(`✔ ${fixtures.length} fixture(s) de PDF removido(s)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
