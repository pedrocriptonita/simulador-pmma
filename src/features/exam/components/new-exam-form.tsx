"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExamAction, type CreateExamState } from "@/features/exam/actions";

type SubjectOption = {
  id: string;
  name: string;
  questionCount: number;
};

const initialState: CreateExamState = {};

export function NewExamForm({ subjects }: { subjects: SubjectOption[] }) {
  const [state, formAction, pending] = useActionState(createExamAction, initialState);
  const [type, setType] = useState<"MIXED" | "BY_SUBJECT">("MIXED");

  const availableSubjects = subjects.filter((subject) => subject.questionCount > 0);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3">
        <Label>Tipo de simulado</Label>
        <RadioGroup
          name="type"
          value={type}
          onValueChange={(value) => setType(value as "MIXED" | "BY_SUBJECT")}
          className="grid gap-2 sm:grid-cols-2"
        >
          <Label
            htmlFor="type-mixed"
            className="border-input has-data-[state=checked]:border-primary flex cursor-pointer items-start gap-3 rounded-lg border p-4"
          >
            <RadioGroupItem value="MIXED" id="type-mixed" className="mt-0.5" />
            <span className="flex flex-col gap-1">
              <span className="font-medium">Misto</span>
              <span className="text-muted-foreground text-sm font-normal">
                Questões de todas as matérias, na proporção do edital.
              </span>
            </span>
          </Label>
          <Label
            htmlFor="type-subject"
            className="border-input has-data-[state=checked]:border-primary flex cursor-pointer items-start gap-3 rounded-lg border p-4"
          >
            <RadioGroupItem value="BY_SUBJECT" id="type-subject" className="mt-0.5" />
            <span className="flex flex-col gap-1">
              <span className="font-medium">Por matéria</span>
              <span className="text-muted-foreground text-sm font-normal">
                Foco total em uma única matéria do edital.
              </span>
            </span>
          </Label>
        </RadioGroup>
      </div>

      {type === "BY_SUBJECT" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="subjectId">Matéria</Label>
          <Select name="subjectId" required>
            <SelectTrigger id="subjectId" className="w-full">
              <SelectValue placeholder="Escolha a matéria" />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.questionCount} questões)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableSubjects.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma matéria com questões publicadas ainda.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="questionCount">Quantidade de questões</Label>
        <Select name="questionCount" defaultValue="10">
          <SelectTrigger id="questionCount" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 questões (30 min)</SelectItem>
            <SelectItem value="15">15 questões (45 min)</SelectItem>
            <SelectItem value="20">20 questões (1h)</SelectItem>
            <SelectItem value="30">30 questões (1h30)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          Cronômetro de 3 minutos por questão, como ritmo de prova.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Gerando simulado..." : "Começar simulado"}
      </Button>
    </form>
  );
}
