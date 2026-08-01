import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PAID_PLAN_SLUG } from "@/lib/billing/config";

/**
 * Número mínimo de simulados corrigidos para exibir o contador na landing.
 *
 * Prova social com número baixo é prova social negativa: "8 simulados
 * corrigidos" comunica que ninguém usa a plataforma. Abaixo do limiar, a
 * landing mostra só a frase geográfica — verdadeira e sem revelar volume.
 * Ajuste conforme a tração real.
 */
const MIN_EXAMS_TO_SHOW = 300;

export type LandingStats = {
  /** Simulados finalizados; null quando ainda não vale a pena exibir. */
  examsCorrected: number | null;
  /** Preço do plano pago, lido do banco para não divergir do checkout. */
  paidPriceCents: number | null;
};

/**
 * Dados da landing. Cacheado por 1h: é a porta do tráfego pago e não pode
 * pagar um roundtrip de banco a cada visita.
 */
export const getLandingStatsCached = unstable_cache(
  async (): Promise<LandingStats> => {
    const [finished, paidPlan] = await Promise.all([
      prisma.exam.count({ where: { finishedAt: { not: null } } }),
      prisma.plan.findUnique({
        where: { slug: PAID_PLAN_SLUG },
        select: { priceCents: true },
      }),
    ]);

    return {
      examsCorrected: finished >= MIN_EXAMS_TO_SHOW ? finished : null,
      paidPriceCents: paidPlan?.priceCents ?? null,
    };
  },
  ["landing:stats"],
  { tags: ["landing-stats", "plans"], revalidate: 3600 },
);
