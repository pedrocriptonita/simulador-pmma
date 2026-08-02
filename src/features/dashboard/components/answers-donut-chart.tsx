"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/**
 * Distribuição das respostas de um simulado: acertos, erros e em branco.
 *
 * Esta é a única parte do produto em que a rosca é o gráfico certo — os três
 * valores SOMAM o total de questões, então cada fatia é uma parte real do
 * todo. O gráfico por matéria continua em barras porque lá os percentuais de
 * acerto são razões independentes e não somam 100%.
 *
 * Cores validadas com scripts/validate_palette.js (skill dataviz), claro e
 * escuro: separação CVD deutan ΔE 11,7 e contraste >= 3:1 em ambos.
 * Azul/vermelho em vez de verde/vermelho — este último reprova em
 * deuteranopia (ΔE 4,8). O cinza fica de propósito abaixo do piso de croma:
 * aqui "cinza" é o significado (ausência de resposta), não um descuido.
 */
const chartConfig = {
  correct: { label: "Acertos", theme: { light: "#2a78d6", dark: "#3987e5" } },
  wrong: { label: "Erros", theme: { light: "#d03b3b", dark: "#e05656" } },
  blank: { label: "Em branco", theme: { light: "#707a86", dark: "#8b95a1" } },
} satisfies ChartConfig;

export function AnswersDonutChart({
  correct,
  wrong,
  blank,
}: {
  correct: number;
  wrong: number;
  blank: number;
}) {
  const total = correct + wrong + blank;
  if (total === 0) return null;

  const data = [
    { key: "correct", label: "Acertos", value: correct, fill: "var(--color-correct)" },
    { key: "wrong", label: "Erros", value: wrong, fill: "var(--color-wrong)" },
    { key: "blank", label: "Em branco", value: blank, fill: "var(--color-blank)" },
  ].filter((slice) => slice.value > 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
      {/* O total no centro é HTML sobreposto, não <Label> em SVG: o
          ChartContainer impõe `text-xs` a tudo que está dentro do <svg>, o
          que quebrava o tamanho e a cor do texto. `pointer-events-none`
          mantém o tooltip da rosca funcionando por baixo. */}
      <div className="relative aspect-square h-[180px]">
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none font-bold tabular-nums">{total}</span>
          <span className="text-muted-foreground mt-1 text-xs">
            {total === 1 ? "questão" : "questões"}
          </span>
        </div>
        <ChartContainer
          config={chartConfig}
          className="size-full"
          aria-label={`Distribuição das respostas: ${correct} acertos, ${wrong} erros e ${blank} em branco, de ${total} questões`}
        >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => {
                  const slice = item.payload as (typeof data)[number];
                  const pct = Math.round((Number(value) / total) * 100);
                  return (
                    <span>
                      <strong>{slice.label}:</strong> {String(value)} de {total} ({pct}%)
                    </span>
                  );
                }}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="58%"
            outerRadius="88%"
            /* Espaçador de 2px entre fatias, conforme spec de marcas */
            paddingAngle={2}
            strokeWidth={2}
            className="stroke-card"
          >
            {data.map((slice) => (
              <Cell key={slice.key} fill={slice.fill} />
            ))}
          </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      {/* Legenda sempre presente: identidade nunca só pela cor. */}
      <ul className="flex w-full max-w-[200px] flex-col gap-2 text-sm">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: slice.fill }}
                aria-hidden
              />
              <span className="text-muted-foreground">{slice.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
