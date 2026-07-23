import Link from "next/link";
import {
  AlarmClock,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DaysUntilExam } from "@/components/landing/days-until-exam";

const STATS = [
  { value: "1.000", label: "vagas de Soldado" },
  { value: "R$ 6.149", label: "salário inicial" },
  { value: "11/10/2026", label: "prova objetiva" },
  { value: "120", label: "itens Certo/Errado" },
];

const STEPS = [
  {
    title: "Crie sua conta grátis",
    description: "Sem cartão. Você já começa com um simulado gratuito por semana.",
  },
  {
    title: "Treine no formato Cebraspe",
    description: "Itens Certo/Errado com cronômetro e a penalização real da banca.",
  },
  {
    title: "Veja sua nota líquida",
    description: "Descubra em quais matérias focar e acompanhe sua evolução até a prova.",
  },
];

const FEATURES = [
  {
    icon: Target,
    title: "Nota líquida real",
    description: "Cada erro anula um acerto, exatamente como o Cebraspe corrige.",
  },
  {
    icon: AlarmClock,
    title: "Cronômetro de prova",
    description: "3 minutos por questão para treinar seu ritmo desde já.",
  },
  {
    icon: BookOpenCheck,
    title: "Gabarito comentado",
    description: "Justificativa objetiva em cada questão após a correção.",
  },
  {
    icon: BarChart3,
    title: "Diagnóstico por matéria",
    description: "Gráficos mostram sua matéria mais fraca — foque onde importa.",
  },
  {
    icon: FileText,
    title: "Resumos em PDF",
    description: "Material direto ao ponto por matéria do edital, para revisar offline.",
  },
  {
    icon: CalendarDays,
    title: "100% edital PMMA 2026",
    description: "Nada genérico: só o conteúdo programático do seu concurso.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header público */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <span className="text-sm font-bold tracking-tight sm:text-base">
            Simulador <span className="text-primary">PM MA</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/cadastro">Criar conta grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-14 pb-10 text-center sm:pt-20">
          <Badge variant="secondary">Edital nº 1 — PMMA/2026 · Banca Cebraspe</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Na prova da PM MA, <span className="text-primary">cada erro anula um acerto.</span> Você
            está treinando do jeito certo?
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-balance">
            Simulados fiéis ao formato Certo/Errado do Cebraspe, com a penalização de verdade.
            Descubra sua <strong className="text-foreground">nota líquida</strong> e o que priorizar
            antes do dia 11 de outubro.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="lg" asChild>
              <Link href="/cadastro">Fazer simulado grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Faltam{" "}
            <strong className="text-foreground tabular-nums">
              <DaysUntilExam />
            </strong>{" "}
            dias para a prova. Cada semana de treino conta.
          </p>
        </section>

        {/* Stats */}
        <section className="border-y">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-px px-4 py-8 text-center sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 py-2">
                <span className="text-2xl font-bold tabular-nums sm:text-3xl">{stat.value}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* A dor: penalização */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            O erro que reprova quem estudou
          </h2>
          <p className="text-muted-foreground max-w-xl text-balance">
            No Cebraspe, marcar errado não vale zero —{" "}
            <strong className="text-foreground">vale menos um</strong>. Quem treina em simulados
            comuns chega na prova com uma falsa sensação de preparo.
          </p>
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tabular-nums">70</span>
                  <span className="text-muted-foreground text-xs">acertos</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-destructive text-2xl font-bold tabular-nums">30</span>
                  <span className="text-muted-foreground text-xs">erros</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-primary text-2xl font-bold tabular-nums">40</span>
                  <span className="text-muted-foreground text-xs">nota final</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                70 acertos − 30 erros = <strong className="text-foreground">40 pontos</strong>, e
                não 70. É assim que a banca corrige — e é assim que treinamos você.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Como funciona */}
        <section className="bg-secondary/50 border-y">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-14">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Como funciona
            </h2>
            <div className="grid w-full gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <Card key={step.title}>
                  <CardHeader>
                    <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Tudo o que você precisa até a aprovação
          </h2>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="text-primary size-6" aria-hidden />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              A prova é em 11 de outubro. Comece hoje, de graça.
            </h2>
            <p className="text-muted-foreground max-w-lg text-balance">
              Crie sua conta, faça seu primeiro simulado gratuito e veja sua nota líquida em
              minutos.
            </p>
            <Button size="lg" asChild>
              <Link href="/cadastro">
                <CheckCircle2 className="size-5" /> Criar conta grátis
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-xs">
          <p className="font-medium">Simulador PM MA 2026</p>
          <p className="max-w-md text-balance">
            Plataforma de estudos independente. Não possui vínculo com a Polícia Militar do
            Maranhão, o Governo do Estado ou a banca Cebraspe.
          </p>
          <div className="flex gap-4 pt-1">
            <Link href="/login" className="hover:text-foreground underline underline-offset-4">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-foreground underline underline-offset-4">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
