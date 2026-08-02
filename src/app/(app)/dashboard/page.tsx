import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClipboardList, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationTracker } from "@/components/analytics/registration-tracker";
import { createClient } from "@/lib/supabase/server";
import { getUserWithPlan } from "@/services/users";
import { getEvolution, getPerformanceBySubject, getSummary } from "@/services/performance";
import { EvolutionLineChart, SubjectBarChart } from "@/features/dashboard/components/charts";
import { ScoreBadge, scoreStatus } from "@/features/dashboard/score-status";

export const metadata: Metadata = { title: "Dashboard" };

function formatScore(value: number | null): string {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await getUserWithPlan(authUser.id);
  if (!user) redirect("/login");

  const hasPaidAccess =
    user.plan?.slug !== "free" && !!user.accessExpiresAt && user.accessExpiresAt >= new Date();

  const [summary, bySubject, evolution] = await Promise.all([
    getSummary(user.id),
    getPerformanceBySubject(user.id),
    getEvolution(user.id),
  ]);

  const weakest =
    bySubject.length > 0
      ? bySubject.reduce((min, item) => (item.accuracy < min.accuracy ? item : min))
      : null;

  const hasData = summary.totalExams > 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <Suspense fallback={null}>
        <RegistrationTracker email={user.email} />
      </Suspense>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user.name ?? user.email.split("@")[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Prova em 11/10/2026 — cada simulado conta.
          </p>
        </div>
        <Badge variant={hasPaidAccess ? "default" : "secondary"}>
          {user.plan?.name ?? "Gratuito"}
        </Badge>
      </div>

      {!hasData ? (
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="text-lg">Seu diagnóstico começa no primeiro simulado</CardTitle>
            <CardDescription>
              Faça um simulado grátis no formato Cebraspe e veja aqui sua nota líquida, o desempenho
              por matéria e a evolução ao longo das semanas até a prova.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <Button size="lg" asChild>
              <Link href="/simulados/novo">Fazer meu primeiro simulado</Link>
            </Button>
            {!hasPaidAccess ? (
              <Button variant="ghost" asChild>
                <Link href="/planos">Ver plano até a prova</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cards de resumo. O chip de ícone tingido é o que tira o aspecto
              chapado sem recorrer a card colorido inteiro — a cor fica no
              elemento pequeno e o texto continua em tinta neutra. */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                label: "Simulados feitos",
                value: String(summary.totalExams),
                foot: `${summary.totalAnswered} questões respondidas`,
                netPercent: null,
              },
              {
                icon: TrendingUp,
                label: "Nota média",
                value: formatScore(summary.averageScoreNet),
                foot: `Melhor: ${formatScore(summary.bestScoreNet)}`,
                netPercent: summary.averageNetPercent,
              },
              {
                icon: Target,
                label: "Última nota",
                value: formatScore(summary.lastScoreNet),
                foot: "Nota líquida (acertos − erros)",
                netPercent: summary.lastNetPercent,
              },
            ].map((item) => {
              const Icon = item.icon;
              // "Simulados feitos" é contagem, não desempenho: não recebe cor
              // de status — pintar de vermelho quem fez poucos simulados
              // seria juízo sobre um dado que não tem qualidade nenhuma.
              const status = item.netPercent !== null ? scoreStatus(item.netPercent) : null;
              return (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <span className="bg-primary/10 text-primary mb-1 flex size-9 items-center justify-center rounded-lg">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle
                      className={`text-3xl tabular-nums ${status ? status.text : ""}`}
                    >
                      {item.value}
                      {item.netPercent !== null ? (
                        <span className="text-muted-foreground ml-2 text-sm font-normal">
                          {item.netPercent}%
                        </span>
                      ) : null}
                    </CardTitle>
                    {status ? <ScoreBadge status={status} className="justify-self-start" /> : null}
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-xs">{item.foot}</CardContent>
                </Card>
              );
            })}
          </div>

          <Button size="lg" className="self-start" asChild>
            <Link href="/simulados/novo">Fazer novo simulado</Link>
          </Button>

          {/* Desempenho por matéria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desempenho por matéria</CardTitle>
              <CardDescription>
                Percentual de acerto nos itens respondidos (a barra vermelha é sua matéria mais
                fraca).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bySubject.length > 0 ? (
                <SubjectBarChart data={bySubject} />
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Responda ao menos uma questão para ver o desempenho por matéria.
                </p>
              )}
              {weakest ? (
                <div className="border-destructive/30 bg-destructive/5 mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <TrendingDown className="text-destructive size-4 shrink-0" />
                  <span>
                    Foque em <strong>{weakest.subjectName}</strong> — seu ponto mais fraco, com{" "}
                    {weakest.accuracy}% de acerto.
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Evolução */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução da nota líquida</CardTitle>
              <CardDescription>
                Sua nota a cada simulado concluído, na ordem em que fez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolution.length > 1 ? (
                <EvolutionLineChart data={evolution} />
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Faça pelo menos dois simulados para acompanhar sua evolução.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
