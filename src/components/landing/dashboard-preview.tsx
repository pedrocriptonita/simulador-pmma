import { BarChart3, BookOpen, Crown, LayoutDashboard, TrendingDown } from "lucide-react";

/**
 * Prévia do dashboard para o hero da landing.
 *
 * É a UI real do produto reconstruída em CSS, não um print: fica nítido em
 * qualquer densidade de tela, não adiciona peso de imagem (a landing é a
 * porta de entrada do tráfego pago — cada 100kb conta no 4G do interior) e
 * acompanha o tema sem precisar de duas versões.
 *
 * Os números são um exemplo representativo de um usuário real: nota líquida
 * modesta e uma matéria fraca em destaque — que é exatamente a "virada de
 * chave" que o produto entrega.
 */

const SUBJECTS = [
  { name: "Língua Portuguesa", pct: 72 },
  { name: "Raciocínio Lógico", pct: 65 },
  { name: "Legislação Institucional", pct: 43, weakest: true },
];

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Simulados" },
  { icon: BookOpen, label: "Materiais" },
  { icon: Crown, label: "Planos" },
];

export function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="Prévia do painel do Simulador PM MA: nota líquida e desempenho por matéria, com a matéria mais fraca destacada"
      className="mx-auto w-full max-w-[280px] select-none"
    >
      {/* Moldura do celular */}
      <div className="bg-foreground/90 rounded-[2rem] p-2 shadow-2xl ring-1 ring-black/10">
        <div className="bg-background overflow-hidden rounded-[1.5rem]">
          {/* Barra do app */}
          <div className="bg-primary text-primary-foreground flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold">
              Simulador <span className="opacity-80">PM MA</span>
            </span>
            <span className="bg-primary-foreground/20 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold">
              A
            </span>
          </div>

          <div className="flex flex-col gap-2 p-3">
            {/* Nota líquida */}
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground text-[10px]">Última nota</p>
              <p className="text-2xl leading-tight font-bold tabular-nums">+8</p>
              <p className="text-muted-foreground text-[10px]">Nota líquida (acertos − erros)</p>
            </div>

            {/* Desempenho por matéria */}
            <div className="rounded-lg border p-3">
              <p className="text-[11px] font-semibold">Desempenho por matéria</p>
              <div className="mt-2 flex flex-col gap-2">
                {SUBJECTS.map((subject) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-14 shrink-0 text-[8px] leading-tight">
                      {subject.name}
                    </span>
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          subject.weakest ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${subject.pct}%` }}
                      />
                    </div>
                    <span className="w-7 shrink-0 text-right text-[9px] font-medium tabular-nums">
                      {subject.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="border-destructive/30 bg-destructive/5 flex items-start gap-1.5 rounded-lg border p-2">
              <TrendingDown className="text-destructive mt-px size-3 shrink-0" aria-hidden />
              <p className="text-[9px] leading-tight">
                Foque em <strong>Legislação Institucional</strong> — seu ponto mais fraco, com 43%
                de acerto.
              </p>
            </div>
          </div>

          {/* Navegação inferior */}
          <div className="grid grid-cols-4 border-t">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-0.5 py-1.5 ${
                    item.active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3" aria-hidden />
                  <span className="text-[7px]">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
