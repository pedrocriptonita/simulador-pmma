/** Remove contas de teste criadas com prefixo teste-autoconfirm- (throwaway). */
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* usa ambiente atual */
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const testUsers = data.users.filter((u) => u.email?.startsWith("teste-autoconfirm-"));
  for (const user of testUsers) {
    await supabase.auth.admin.deleteUser(user.id);
    console.log("Removida:", user.email);
  }
  if (testUsers.length === 0) console.log("Nenhuma conta de teste encontrada.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
