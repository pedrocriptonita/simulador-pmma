"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = () => <Skeleton className="h-[280px] w-full" />;

/**
 * Carregamento dinâmico dos gráficos (recharts é pesado). Mantém o
 * bundle inicial do dashboard leve; o gráfico entra client-side com
 * um skeleton enquanto carrega.
 */
export const SubjectBarChart = dynamic(
  () => import("./subject-bar-chart").then((m) => m.SubjectBarChart),
  { ssr: false, loading: chartLoading },
);

export const EvolutionLineChart = dynamic(
  () => import("./evolution-line-chart").then((m) => m.EvolutionLineChart),
  { ssr: false, loading: chartLoading },
);

export const AnswersDonutChart = dynamic(
  () => import("./answers-donut-chart").then((m) => m.AnswersDonutChart),
  { ssr: false, loading: () => <Skeleton className="h-[180px] w-full" /> },
);
