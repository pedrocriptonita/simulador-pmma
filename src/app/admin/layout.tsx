import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getUserWithPlan } from "@/services/users";

/** Painel administrativo: exige sessão + role ADMIN. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?next=/admin");
  }

  const user = await getUserWithPlan(authUser.id);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-bold tracking-tight"
            >
              Simulador <span className="text-primary">PM MA</span>
              <Badge variant="outline">Admin</Badge>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/questoes">Questões</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/materiais">Materiais</Link>
              </Button>
            </nav>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Voltar ao app
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
