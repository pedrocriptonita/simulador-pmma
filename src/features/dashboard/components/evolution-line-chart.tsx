"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { EvolutionPoint } from "@/services/performance";

const chartConfig = {
  scoreNet: { label: "Nota líquida", theme: { light: "#2a78d6", dark: "#3987e5" } },
} satisfies ChartConfig;

export function EvolutionLineChart({ data }: { data: EvolutionPoint[] }) {
  const rows = data.map((point) => ({
    ...point,
    dateLabel: point.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[280px] w-full"
      aria-label="Evolução da nota líquida por simulado"
    >
      <LineChart accessibilityLayer data={rows} margin={{ left: 4, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const row = item.payload as (typeof rows)[number];
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      Simulado {row.label} · {row.dateLabel}
                    </span>
                    <span className="text-muted-foreground">
                      Nota líquida {Number(value) > 0 ? "+" : ""}
                      {value} · {row.totalQuestions} questões
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Line
          dataKey="scoreNet"
          type="monotone"
          stroke="var(--color-scoreNet)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-scoreNet)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
