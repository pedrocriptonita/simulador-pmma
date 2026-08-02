import Link from "next/link";
import {
  AlarmClock,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gift,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { DaysUntilExam } from "@/components/landing/days-until-exam";
import { getLandingStatsCached } from "@/services/landing";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

const COMPARISON = [
  { feature: "Simula a penalização do Cebraspe", courseNote: "Genérico" },
  { feature: "Focado 100% no edital PM MA" },
  { feature: "Mostra sua nota líquida real" },
  { feature: "Diz em qual matéria focar" },
];

/** Marcadores da tabela comparativa. Ícone em vez de emoji: o emoji varia de
 *  desenho entre sistemas e destoa da tipografia do resto da página. */
function Nao({ nota }: { nota?: string }) {
  return (
    <span className="text-muted-foreground inline-flex items-center justify-center gap-1.5">
      <X className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">Não</span>
      {nota ? <span className="text-xs">{nota}</span> : null}
    </span>
  );
}

function Sim() {
  return (
    <span className="text-primary inline-flex items-center justify-center">
      <Check className="size-5 shrink-0" aria-hidden />
      <span className="sr-only">Sim</span>
    </span>
  );
}

/** Objeções reais do público (nível médio, sensível a preço, desconfiado com compra online). */
const FAQ = [
  {
    q: "O simulado é igual à prova de verdade?",
    a: "Sim — formato Certo/Errado do Cebraspe, cronometrado e com a mesma regra de correção do Edital nº 1 – PMMA/2026: cada erro anula um acerto.",
  },
  {
    q: "Preciso pagar para testar?",
    a: "Não. Você tem 1 simulado grátis por semana, sem cadastrar cartão de crédito.",
  },
  {
    q: "O pagamento é mensal?",
    a: "Não. É pagamento único de R$ 39,90 e o acesso vale até o dia da prova, 11/10/2026.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim, 100% — foi feito para celular. Não precisa instalar nada, é só abrir no navegador.",
  },
  {
    q: "As questões são do nível do concurso?",
    a: "Sim. São criadas matéria por matéria conforme o conteúdo programático do edital, no nível médio exigido.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia total. Pediu, devolvemos 100% do valor, sem perguntas.",
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

export default async function Home() {
  const { examsCorrected, paidPriceCents } = await getLandingStatsCached();

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
        {/* Hero — CTA único: o público vem de anúncio e quase ninguém já tem conta,
            então "Entrar" fica só no header para não competir com a conversão. */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-12 pb-10 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <Badge variant="secondary">Edital nº 1 — PMMA/2026 · Banca Cebraspe</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                Na prova da PM MA, <span className="text-primary">cada erro anula um acerto.</span>{" "}
                Você está treinando do jeito certo?
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg text-balance">
                Simulados fiéis ao formato Certo/Errado do Cebraspe, com a penalização de verdade.
                Descubra sua <strong className="text-foreground">nota líquida</strong> e o que
                priorizar antes do dia 11 de outubro.
              </p>
              <div className="flex flex-col items-center gap-2 lg:items-start">
                <Button size="lg" asChild>
                  <Link href="/cadastro">Fazer meu simulado grátis</Link>
                </Button>
                <p className="text-muted-foreground text-sm">
                  Sem cartão de crédito · Leva 2 minutos para começar
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                Faltam{" "}
                <strong className="text-foreground tabular-nums">
                  <DaysUntilExam />
                </strong>{" "}
                dias para a prova. Cada semana de treino conta.
              </p>
            </div>

            <DashboardPreview />
          </div>
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
          {/* Âncora visual da página: é o argumento que sustenta a oferta
              inteira, então tem peso tipográfico maior que qualquer outro
              bloco. O "40" é vermelho de propósito — antes era azul, a mesma
              cor dos elementos positivos, e isso contradizia a mensagem. */}
          <div className="bg-card w-full max-w-2xl rounded-xl border p-6 sm:p-8">
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bold tabular-nums sm:text-6xl">70</span>
                <span className="text-muted-foreground text-xs sm:text-sm">acertos</span>
              </div>
              <span className="text-muted-foreground pb-6 text-2xl font-light sm:pb-9 sm:text-4xl">
                −
              </span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bold tabular-nums sm:text-6xl">30</span>
                <span className="text-muted-foreground text-xs sm:text-sm">erros</span>
              </div>
              <span className="text-muted-foreground pb-6 text-2xl font-light sm:pb-9 sm:text-4xl">
                =
              </span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-destructive text-5xl font-bold tabular-nums sm:text-7xl">
                  40
                </span>
                <span className="text-destructive text-xs font-semibold sm:text-sm">
                  nota real
                </span>
              </div>
            </div>
            <p className="mt-6 border-t pt-5 text-center text-base text-balance sm:text-lg">
              Você achou que tinha <strong>70</strong>. A banca contou{" "}
              <strong className="text-destructive">40</strong>.
            </p>
            <p className="text-muted-foreground mt-2 text-center text-sm text-balance">
              É assim que o Cebraspe corrige — e é assim que treinamos você desde o primeiro
              simulado.
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-secondary/50 border-y">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-14">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Como funciona
            </h2>
            {/* Trilha numerada em vez de cards: a seção seguinte (Features) já
                é uma grade de cards, e duas grades iguais coladas fazem o olho
                escorregar sem encontrar hierarquia. */}
            <ol className="grid w-full gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums">
                      {index + 1}
                    </span>
                    {/* Linha de conexão entre as etapas, só no desktop */}
                    {index < STEPS.length - 1 ? (
                      <span className="bg-border hidden h-px flex-1 sm:block" aria-hidden />
                    ) : null}
                  </div>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </li>
              ))}
            </ol>
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

        {/* Prova social — só dados reais. Sem depoimento inventado: além de
            violar CDC/CONAR e política do Meta, é o tipo de coisa que derruba
            conta de anúncios. O contador se esconde sozinho enquanto o número
            for baixo demais para ajudar (ver services/landing.ts). */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 text-center">
            {examsCorrected !== null ? (
              <p className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                <BarChart3 className="text-primary size-7 shrink-0" aria-hidden />
                {examsCorrected.toLocaleString("pt-BR")} simulados já corrigidos na plataforma
              </p>
            ) : null}
            <p className="text-muted-foreground max-w-xl text-balance">
              Candidatos de <strong className="text-foreground">São Luís</strong>,{" "}
              <strong className="text-foreground">Imperatriz</strong>,{" "}
              <strong className="text-foreground">Caxias</strong> e todo o Maranhão já treinam por
              aqui.
            </p>
          </div>
        </section>

        {/* Comparativo */}
        <section className="bg-secondary/50 border-y">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-14">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Por que não basta estudar por questões comuns
            </h2>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium" />
                    <th className="text-muted-foreground p-3 text-center font-medium">
                      Estudar sozinho
                    </th>
                    <th className="text-muted-foreground p-3 text-center font-medium">
                      Cursos genéricos
                    </th>
                    <th className="text-primary p-3 text-center font-bold">Simulador PM MA</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b">
                      <td className="p-3 font-medium">{row.feature}</td>
                      <td className="p-3 text-center">
                        <Nao />
                      </td>
                      <td className="p-3 text-center">
                        <Nao nota={row.courseNote} />
                      </td>
                      <td className="p-3 text-center">
                        <Sim />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 font-medium">Preço</td>
                    <td className="text-muted-foreground p-3 text-center">
                      &quot;Grátis&quot;
                      <br />
                      <span className="text-xs">(custa a aprovação)</span>
                    </td>
                    <td className="text-muted-foreground p-3 text-center">R$ 400–900/ano</td>
                    <td className="text-primary p-3 text-center font-bold">
                      {paidPriceCents ? formatPrice(paidPriceCents) : "—"}
                      <br />
                      <span className="text-foreground text-xs font-normal">
                        único, até a prova
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Oferta — o objetivo da página continua sendo o cadastro grátis, por
            isso o CTA principal aqui é o gratuito e o pago aparece como
            informação, não como barreira. */}
        <section className="mx-auto w-full max-w-2xl px-4 py-14">
          <Card className="border-primary/40">
            <CardHeader className="items-center gap-2 text-center">
              <Badge>Acesso completo</Badge>
              <CardTitle className="text-3xl font-bold tabular-nums">
                {paidPriceCents ? formatPrice(paidPriceCents) : "—"}
              </CardTitle>
              <CardDescription className="text-base">
                Pagamento único · acesso total até o dia da prova (11/10/2026)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  Simulados ilimitados até a prova
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  Dashboard completo por matéria
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  Gabarito comentado em cada questão
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                  Biblioteca de PDFs por matéria do edital (incluída)
                </li>
              </ul>
              <p className="bg-secondary/60 flex items-start gap-2 rounded-lg p-3 text-sm">
                <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <strong>7 dias de garantia incondicional.</strong> Não gostou? Devolvemos 100%,
                  sem perguntas.
                </span>
              </p>
              <div className="flex flex-col items-center gap-2 pt-1">
                <Button size="lg" asChild>
                  <Link href="/cadastro">Começar pelo simulado grátis</Link>
                </Button>
                <p className="text-muted-foreground text-center text-sm text-balance">
                  Ainda em dúvida? Comece grátis, sem cartão. Você decide depois de ver sua nota
                  real.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ — <details> nativo: acessível, funciona sem JS e não adiciona
            dependência nova ao bundle da landing. */}
        <section className="bg-secondary/50 border-y">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-14">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="flex w-full flex-col gap-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="bg-background group rounded-lg border px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {item.q}
                    <ChevronDown
                      className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-balance">
              <ShieldCheck className="text-primary size-4 shrink-0" aria-hidden />
              <span>
                <strong className="text-foreground">7 dias de garantia incondicional</strong> no
                acesso pago. Não gostou? Devolvemos 100%, sem perguntas.
              </span>
            </p>
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
          <div className="flex flex-wrap justify-center gap-4 pt-1">
            <Link href="/login" className="hover:text-foreground underline underline-offset-4">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-foreground underline underline-offset-4">
              Criar conta
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-foreground underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
