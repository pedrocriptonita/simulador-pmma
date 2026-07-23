/**
 * Confirma (ou cria já confirmado) um usuário no Supabase Auth,
 * contornando o limite de e-mails do SMTP embutido em desenvolvimento.
 * Também garante o registro espelho em public.users (plano Free).
 *
 * Uso: npx tsx scripts/confirm-user.ts <email> [senha] [nome]
 */
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma";
import { ensureUser } from "../src/services/users";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];

  if (!email) {
    console.error("Uso: npx tsx scripts/confirm-user.ts <email> [senha] [nome]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Faltam as chaves do Supabase no .env.local");

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Procura o usuário já criado pelo signUp (mesmo sem e-mail confirmado)
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existing = list.users.find((u) => u.email === email);
  let authUser;

  if (existing) {
    if (existing.email_confirmed_at) {
      console.log(`✔ ${email} já estava confirmado.`);
      authUser = existing;
    } else {
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
      });
      if (error) throw error;
      authUser = data.user;
      console.log(`✔ ${email} confirmado (conta já existia).`);
    }
  } else {
    if (!password) {
      console.error(`Usuário ${email} não existe ainda. Informe uma senha para criá-lo:`);
      console.error("  npx tsx scripts/confirm-user.ts <email> <senha> [nome]");
      process.exit(1);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { name } : undefined,
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`✔ ${email} criado e já confirmado.`);
  }

  if (authUser) {
    await ensureUser(authUser);
    console.log("✔ Registro em public.users garantido (plano Free).");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
