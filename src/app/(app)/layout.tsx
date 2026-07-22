import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUser } from "@/services/users";

/**
 * Área logada: exige sessão (defesa em profundidade além do proxy)
 * e garante o registro User com plano Free no primeiro acesso.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUser(user);

  return <>{children}</>;
}
