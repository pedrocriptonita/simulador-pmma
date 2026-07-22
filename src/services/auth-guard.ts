import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/** Usuário do Supabase Auth da sessão atual (null se deslogado). */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Exige sessão; redireciona ao login se ausente. */
export async function requireUser() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}

/** Exige sessão + role ADMIN; redireciona caso contrário. */
export async function requireAdmin() {
  const authUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
