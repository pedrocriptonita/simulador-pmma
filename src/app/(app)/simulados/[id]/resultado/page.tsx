import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, Minus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/services/auth-guard";
import { getExamResult } from "@/services/exams";

export const metadata: Metadata = { title: "Resultado do simulado" };

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const result = await getExamResult(authUser.id, id);
  if (!result) notFound();
  if (result.inProgress) redirect(`/simulados/${id}`);

  const { exam, answers } = result;
  const scoreNet = exam.scoreNet ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      {/* Nota líquida em destaque */}
      <Card>
        <CardHeader className="items-center text-center">
          <CardDescription>Sua nota líquida (estilo Cebraspe)</CardDescription>
          <CardTitle className="text-5xl tabular-nums">
            {scoreNet > 0 ? "+" : ""}
            {scoreNet}
          </CardTitle>
          <CardDescription>
            {exam.title ?? "Simulado"} ·{" "}
            {exam.finishedAt?.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border p-3">
              <p className="text-2xl font-bold tabular-nums">{exam.correctCount ?? 0}</p>
              <p className="text-muted-foreground text-xs">Acertos</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-destructive text-2xl font-bold tabular-nums">
                {exam.wrongCount ?? 0}
              </p>
              <p className="text-muted-foreground text-xs">Erros</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground text-2xl font-bold tabular-nums">
                {exam.blankCount ?? 0}
              </p>
              <p className="text-muted-foreground text-xs">Em branco</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Como o Cebraspe calcula sua nota</AlertTitle>
        <AlertDescription>
          Cada resposta errada anula uma certa: nota líquida = acertos − erros. Questões em branco
          não pontuam nem penalizam. Por isso, chutar sem convicção derruba sua nota na prova real.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/simulados/novo">Fazer outro simulado</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/simulados">Ver histórico</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      {/* Gabarito comentado */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Gabarito comentado</h2>
        {answers.map((answer) => {
          const wasBlank = answer.userAnswer === null;
          const wasCorrect = answer.isCorrect === true;
          return (
            <Card key={answer.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Questão {answer.order} · {answer.question.subject.name}
                  </p>
                  {wasBlank ? (
                    <Badge variant="secondary">
                      <Minus className="size-3" /> Em branco
                    </Badge>
                  ) : wasCorrect ? (
                    <Badge>
                      <Check className="size-3" /> Acertou
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="size-3" /> Errou (−1)
                    </Badge>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{answer.question.statement}</p>
                <div className="text-sm">
                  <p>
                    <span className="text-muted-foreground">Gabarito:</span>{" "}
                    <strong>{answer.question.correctAnswer ? "CERTO" : "ERRADO"}</strong>
                    {!wasBlank ? (
                      <>
                        {" "}
                        · <span className="text-muted-foreground">Sua resposta:</span>{" "}
                        <strong>{answer.userAnswer ? "CERTO" : "ERRADO"}</strong>
                      </>
                    ) : null}
                  </p>
                </div>
                {answer.question.explanation ? (
                  <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed">
                    {answer.question.explanation}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
