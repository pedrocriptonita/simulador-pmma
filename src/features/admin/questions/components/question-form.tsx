"use client";

import { useActionState } from "react";
import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionFormState } from "@/features/admin/questions/actions";

type SubjectOption = { id: string; name: string };

export type QuestionFormDefaults = {
  subjectId?: string;
  statement?: string;
  correctAnswer?: boolean;
  explanation?: string;
  difficulty?: string;
  isPublished?: boolean;
};

const initialState: QuestionFormState = {};

export function QuestionForm({
  action,
  subjects,
  defaults = {},
  submitLabel,
}: {
  action: (prev: QuestionFormState, formData: FormData) => Promise<QuestionFormState>;
  subjects: SubjectOption[];
  defaults?: QuestionFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="subjectId">Matéria</Label>
        <Select name="subjectId" defaultValue={defaults.subjectId} required>
          <SelectTrigger id="subjectId" className="w-full">
            <SelectValue placeholder="Escolha a matéria" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="statement">Enunciado (item a ser julgado)</Label>
        <Textarea
          id="statement"
          name="statement"
          rows={4}
          defaultValue={defaults.statement}
          placeholder="Ex.: Segundo a CF/88, as polícias militares são forças auxiliares e reserva do Exército."
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Gabarito</Label>
        <RadioGroup
          name="correctAnswer"
          defaultValue={
            defaults.correctAnswer === undefined
              ? undefined
              : defaults.correctAnswer
                ? "CERTO"
                : "ERRADO"
          }
          className="flex gap-4"
          required
        >
          <Label htmlFor="gab-certo" className="flex cursor-pointer items-center gap-2">
            <RadioGroupItem value="CERTO" id="gab-certo" /> CERTO
          </Label>
          <Label htmlFor="gab-errado" className="flex cursor-pointer items-center gap-2">
            <RadioGroupItem value="ERRADO" id="gab-errado" /> ERRADO
          </Label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="explanation">Gabarito comentado (opcional)</Label>
        <Textarea
          id="explanation"
          name="explanation"
          rows={3}
          defaultValue={defaults.explanation}
          placeholder="Justificativa curta exibida ao candidato após a correção."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="difficulty">Dificuldade</Label>
        <Select name="difficulty" defaultValue={defaults.difficulty ?? "MEDIO"}>
          <SelectTrigger id="difficulty" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FACIL">Fácil</SelectItem>
            <SelectItem value="MEDIO">Médio</SelectItem>
            <SelectItem value="DIFICIL">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isPublished"
          name="isPublished"
          defaultChecked={defaults.isPublished ?? false}
        />
        <Label htmlFor="isPublished">Publicada (entra nos simulados)</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/questoes">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
