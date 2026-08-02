import { AlertTriangle, CircleAlert, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Classificação do aproveitamento líquido, para colorir notas.
 *
 * Duas decisões que valem explicação:
 *
 * 1. As faixas são de NOTA LÍQUIDA (acertos − erros), não de acerto bruto.
 *    Com a penalização do Cebraspe as duas escalas divergem muito: 75% de
 *    acerto vira 50% líquido; 55% de acerto vira só 10% líquido. As faixas
 *    abaixo estão ancoradas no acerto bruto equivalente, indicado em cada
 *    linha, para ficar simples de recalibrar depois com dado real.
 *
 * 2. Cor nunca vem sozinha. A paleta de status reserva quatro passos e exige
 *    que venham com ícone e rótulo — em superfície clara o amarelo e o
 *    laranja ficam abaixo de 3:1 de contraste por definição, e é a dupla
 *    ícone+texto que compensa. Além disso, "verde = bom" não significa nada
 *    para quem tem daltonismo ou está de relance.
 */
export type ScoreTone = "good" | "warning" | "serious" | "critical";

export type ScoreStatus = {
  tone: ScoreTone;
  label: string;
  Icon: LucideIcon;
  /** Classe de cor do número e do ícone. */
  text: string;
  /** Fundo tênue para o chip do rótulo. */
  chip: string;
};

const STATUS: Record<ScoreTone, Omit<ScoreStatus, "tone">> = {
  good: {
    label: "Bom ritmo",
    Icon: TrendingUp,
    text: "text-[#0a7d3f] dark:text-[#3fbf74]",
    chip: "bg-[#0a7d3f]/10 text-[#0a7d3f] dark:bg-[#3fbf74]/15 dark:text-[#3fbf74]",
  },
  warning: {
    label: "Dá para melhorar",
    Icon: CircleAlert,
    text: "text-[#a76a00] dark:text-[#fab219]",
    chip: "bg-[#fab219]/15 text-[#a76a00] dark:bg-[#fab219]/15 dark:text-[#fab219]",
  },
  serious: {
    label: "Atenção",
    Icon: AlertTriangle,
    text: "text-[#c2571f] dark:text-[#ec835a]",
    chip: "bg-[#ec835a]/15 text-[#c2571f] dark:bg-[#ec835a]/15 dark:text-[#ec835a]",
  },
  critical: {
    label: "Precisa reagir",
    Icon: TrendingDown,
    text: "text-destructive",
    chip: "bg-destructive/10 text-destructive",
  },
};

/**
 * @param netPercent aproveitamento líquido em % (pode ser negativo)
 */
export function scoreStatus(netPercent: number): ScoreStatus {
  // ≥ 50% líquido  ≈ 75% de acerto bruto
  if (netPercent >= 50) return { tone: "good", ...STATUS.good };
  // 30–49% líquido ≈ 65–74% de acerto bruto
  if (netPercent >= 30) return { tone: "warning", ...STATUS.warning };
  // 10–29% líquido ≈ 55–64% de acerto bruto
  if (netPercent >= 10) return { tone: "serious", ...STATUS.serious };
  // < 10% líquido — inclui nota negativa (mais erros que acertos)
  return { tone: "critical", ...STATUS.critical };
}

/**
 * Chip com ícone + rótulo. É o que torna a cor legível sem depender dela.
 *
 * `className` existe para o posicionamento: o CardHeader do shadcn é um GRID,
 * não flex, então um filho sem `justify-self` estica para a largura da coluna
 * — o chip virava uma barra atravessando o card. Quem usa passa
 * `justify-self-start` ou `justify-self-center`.
 */
export function ScoreBadge({ status, className }: { status: ScoreStatus; className?: string }) {
  const { Icon, label, chip } = status;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${chip} ${className ?? ""}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
