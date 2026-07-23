import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Dados de catálogo (matérias e planos) mudam raramente. Cacheados com
 * tags para revalidar sob demanda (ex.: após editar no admin) e um TTL
 * de segurança de 1h. Reduz consultas repetidas em telas públicas.
 */

export const getSubjectsCached = unstable_cache(
  async () =>
    prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, category: true, weight: true, order: true },
    }),
  ["catalog:subjects"],
  { tags: ["subjects"], revalidate: 3600 },
);

export const getPlansCached = unstable_cache(
  async () =>
    prisma.plan.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { priceCents: "asc" },
      select: { id: true, name: true, slug: true, description: true, priceCents: true },
    }),
  ["catalog:plans"],
  { tags: ["plans"], revalidate: 3600 },
);
