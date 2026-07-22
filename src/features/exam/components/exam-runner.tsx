"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Check, Clock, Flag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { finishExamAction, saveAnswerAction } from "@/features/exam/actions";

export type RunnerItem = {
  examAnswerId: string;
  order: number;
  statement: string;
  subjectName: string;
  userAnswer: boolean | null;
};

type Props = {
  examId: string;
  title: string;
  /** Epoch ms do fim do cronômetro (persistente: startedAt + duração). */
  endsAt: number | null;
  items: RunnerItem[];
};

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ExamRunner({ examId, title, endsAt, items }: Props) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(() =>
    Object.fromEntries(items.map((item) => [item.examAnswerId, item.userAnswer])),
  );
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    endsAt ? Math.max(0, Math.floor((endsAt - Date.now()) / 1000)) : null,
  );
  const [, startTransition] = useTransition();
  const [finishing, setFinishing] = useState(false);
  const finishedRef = useRef(false);

  const current = items[index]!;
  const currentAnswer = answers[current.examAnswerId] ?? null;
  const answeredCount = Object.values(answers).filter((value) => value !== null).length;
  const blankCount = items.length - answeredCount;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinishing(true);
    startTransition(() => finishExamAction(examId));
  }, [examId]);

  // Cronômetro persistente: recalcula a partir de endsAt a cada segundo
  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) finish();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt, finish]);

  function answer(value: boolean | null) {
    const id = current.examAnswerId;
    const next = answers[id] === value ? null : value; // clicar de novo limpa
    setAnswers((prev) => ({ ...prev, [id]: next }));
    startTransition(async () => {
      const result = await saveAnswerAction(id, next);
      if (!result.ok && (result.reason === "expired" || result.reason === "finished")) {
        finish();
      }
    });
  }

  const lowTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior: título + cronômetro */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Questão {index + 1} de {items.length} · {current.subjectName}
          </p>
        </div>
        {secondsLeft !== null ? (
          <Badge
            variant={lowTime ? "destructive" : "secondary"}
            className="px-3 py-1.5 font-mono text-base tabular-nums"
          >
            <Clock className="mr-1 size-4" />
            {formatTime(secondsLeft)}
          </Badge>
        ) : null}
      </div>

      {/* Enunciado */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{current.statement}</p>
          <p className="text-muted-foreground mt-4 text-sm">
            Julgue o item: <strong>CERTO</strong> ou <strong>ERRADO</strong>. Errar desconta um
            acerto — na dúvida, deixe em branco.
          </p>
        </CardContent>
      </Card>

      {/* Botões de resposta */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="lg"
          variant={currentAnswer === true ? "default" : "outline"}
          className="h-14 text-base"
          onClick={() => answer(true)}
          disabled={finishing}
        >
          <Check className="size-5" /> CERTO
        </Button>
        <Button
          type="button"
          size="lg"
          variant={currentAnswer === false ? "default" : "outline"}
          className="h-14 text-base"
          onClick={() => answer(false)}
          disabled={finishing}
        >
          <X className="size-5" /> ERRADO
        </Button>
      </div>
      {currentAnswer !== null ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground self-center"
          onClick={() => answer(currentAnswer)}
          disabled={finishing}
        >
          Limpar resposta (deixar em branco)
        </Button>
      ) : null}

      {/* Navegação */}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || finishing}
        >
          Anterior
        </Button>
        {index < items.length - 1 ? (
          <Button
            type="button"
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={finishing}
          >
            Próxima
          </Button>
        ) : (
          <FinishDialog
            answeredCount={answeredCount}
            blankCount={blankCount}
            finishing={finishing}
            onConfirm={finish}
          />
        )}
      </div>

      {/* Mapa de questões */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-3 text-sm">
            Mapa — {answeredCount} respondida{answeredCount === 1 ? "" : "s"}, {blankCount} em
            branco
          </p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {items.map((item, itemIndex) => {
              const value = answers[item.examAnswerId] ?? null;
              return (
                <button
                  key={item.examAnswerId}
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  disabled={finishing}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                    value !== null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted",
                    itemIndex === index && "ring-ring ring-2 ring-offset-1",
                  )}
                >
                  {item.order}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <FinishDialog
        answeredCount={answeredCount}
        blankCount={blankCount}
        finishing={finishing}
        onConfirm={finish}
        variant="secondary"
      />
    </div>
  );
}

function FinishDialog({
  answeredCount,
  blankCount,
  finishing,
  onConfirm,
  variant = "default",
}: {
  answeredCount: number;
  blankCount: number;
  finishing: boolean;
  onConfirm: () => void;
  variant?: "default" | "secondary";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} disabled={finishing}>
          <Flag className="size-4" /> {finishing ? "Finalizando..." : "Finalizar simulado"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar simulado?</DialogTitle>
          <DialogDescription>
            Você respondeu {answeredCount} questõ{answeredCount === 1 ? "e" : "es"} e deixou{" "}
            {blankCount} em branco. Após finalizar, o simulado será corrigido no estilo Cebraspe
            (cada erro anula um acerto) e não poderá ser alterado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onConfirm} disabled={finishing}>
            {finishing ? "Corrigindo..." : "Finalizar e corrigir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
