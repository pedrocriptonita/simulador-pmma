import { redirect } from "next/navigation";
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

  return <>{children}</>;
}
