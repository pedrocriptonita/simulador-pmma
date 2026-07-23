/**
 * Cria o bucket privado `pdfs` no Supabase Storage (idempotente).
 * Rodar com: npx tsx scripts/create-bucket.ts
 */
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // segue com o ambiente atual
}

const PDF_BUCKET = "pdfs";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey)
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await supabase.storage.getBucket(PDF_BUCKET);
  if (existing) {
    console.log(`✔ Bucket "${PDF_BUCKET}" já existe (privado=${!existing.public ? "sim" : "NÃO"})`);
    return;
  }

  const { error } = await supabase.storage.createBucket(PDF_BUCKET, {
    public: false,
    allowedMimeTypes: ["application/pdf"],
    fileSizeLimit: "25MB",
  });
  if (error) throw error;
  console.log(`✔ Bucket privado "${PDF_BUCKET}" criado (PDF, máx. 25MB)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
