import { prisma } from "@/lib/prisma";

export type AccessCheck =
  | { status: "allowed" }
  | { status: "blocked_free_limit"; nextAvailableAt: Date }
  | { status: "blocked_expired" };

export const FREE_EXAMS_PER_WEEK = 1;

/** Maranhão: UTC-3, sem horário de verão. */
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Segunda-feira 00:00 no fuso do Maranhão, como instante UTC. */
export function startOfCurrentWeek(now = new Date()): Date {
  const local = new Date(now.getTime() - BRT_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const mondayUtc = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - daysSinceMonday,
  );
  return new Date(mondayUtc + BRT_OFFSET_MS);
}

/**
 * Gate de plano do roadmap (3.3):
 * - ADMIN: sempre liberado (facilita teste/manutenção)
 * - Plano pago: liberado enquanto accessExpiresAt >= agora
 * - Plano Free: máx. 1 simulado criado na semana corrente (seg-dom)
 */
export async function checkAccess(userId: string): Promise<AccessCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });
  if (!user) return { status: "blocked_expired" };

  if (user.role === "ADMIN") return { status: "allowed" };

  const isPaidPlan = !!user.plan && user.plan.slug !== "free";
  if (isPaidPlan) {
    if (user.accessExpiresAt && user.accessExpiresAt >= new Date()) {
      return { status: "allowed" };
    }
    return { status: "blocked_expired" };
  }

  const weekStart = startOfCurrentWeek();
  const usedThisWeek = await prisma.exam.count({
    where: { userId, createdAt: { gte: weekStart } },
  });
  if (usedThisWeek >= FREE_EXAMS_PER_WEEK) {
    return {
      status: "blocked_free_limit",
      nextAvailableAt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }
  return { status: "allowed" };
}

/**
 * Acesso pago vigente (para liberar PDFs premium e recursos exclusivos).
 * ADMIN sempre tem; plano pago com accessExpiresAt no futuro também.
 */
export async function hasPaidAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const isPaidPlan = !!user.plan && user.plan.slug !== "free";
  return isPaidPlan && !!user.accessExpiresAt && user.accessExpiresAt >= new Date();
}
