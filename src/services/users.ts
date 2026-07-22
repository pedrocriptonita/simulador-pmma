import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

/**
 * Garante que o usuário autenticado no Supabase Auth tenha o registro
 * espelho em public.users, criado com o plano Free no primeiro acesso.
 * Idempotente (upsert) — seguro chamar em todo carregamento da área logada.
 */
export async function ensureUser(authUser: SupabaseAuthUser) {
  const name =
    (authUser.user_metadata?.name as string | undefined) ??
    (authUser.user_metadata?.full_name as string | undefined) ??
    null;

  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: {
      id: authUser.id,
      email: authUser.email ?? "",
      name,
      planId: freePlan?.id,
    },
    include: { plan: true },
  });
}

/** Usuário atual (com plano) a partir do id do Supabase Auth. */
export async function getUserWithPlan(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });
}
