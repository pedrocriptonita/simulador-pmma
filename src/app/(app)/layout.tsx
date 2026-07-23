import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { createClient } from "@/lib/supabase/server";
import { ensureUser } from "@/services/users";

/**
 * Área logada: exige sessão (defesa em profundidade além do proxy),
 * garante o registro User com plano Free no primeiro acesso e aplica
 * o shell (header + bottom nav mobile).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await ensureUser(authUser);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-bold tracking-tight sm:text-base">
              Simulador <span className="text-primary">PM MA</span>
            </Link>
            <MainNav />
          </div>
          <UserMenu
            name={user.name}
            email={user.email}
            planName={user.plan?.name ?? "Gratuito"}
            isAdmin={user.role === "ADMIN"}
          />
        </div>
      </header>

      {/* pb no mobile para o conteúdo não ficar atrás da bottom nav */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>

      <BottomNav />
    </div>
  );
}
