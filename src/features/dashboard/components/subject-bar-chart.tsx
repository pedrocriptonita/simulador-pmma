"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SubjectPerformance } from "@/services/performance";

// Cores validadas (dataviz): azul = série; vermelho = matéria mais fraca (atenção)
const chartConfig = {
  accuracy: { label: "Acerto", theme: { light: "#2a78d6", dark: "#3987e5" } },
  weak: { label: "Mais fraca", theme: { light: "#d03b3b", dark: "#d03b3b" } },
} satisfies ChartConfig;

/** Abrevia nomes longos para o eixo (ex.: "Legislação Institucional"). */
function shortName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

export function SubjectBarChart({ data }: { data: SubjectPerformance[] }) {
  const weakestId =
    data.length > 1
      ? data.reduce((min, item) => (item.accuracy < min.accuracy ? item : min)).subjectId
      : null;

  const rows = data.map((item) => ({ ...item, short: shortName(item.subjectName) }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[280px] w-full"
      aria-label="Percentual de acerto por matéria"
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: 8, right: 40, top: 4, bottom: 4 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="short"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const row = item.payload as (typeof rows)[number];
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{row.subjectName}</span>
                    <span className="text-muted-foreground">
                      {value}% de acerto · {row.correct}/{row.answered} certas
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Bar dataKey="accuracy" radius={4} barSize={22}>
          {rows.map((row) => (
            <Cell
              key={row.subjectId}
              fill={row.subjectId === weakestId ? "var(--color-weak)" : "var(--color-accuracy)"}
            />
          ))}
          <LabelList
            dataKey="accuracy"
            position="right"
            offset={8}
            className="fill-foreground text-xs tabular-nums"
            formatter={(value: unknown) => `${value}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
