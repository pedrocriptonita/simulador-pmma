"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { importQuestionsAction, type ImportState } from "@/features/admin/questions/actions";

const initialState: ImportState = {};

const EXAMPLE = `[
  {
    "materia": "lingua-portuguesa",
    "enunciado": "Texto do item a ser julgado.",
    "gabarito": "CERTO",
    "explicacao": "Justificativa curta.",
    "dificuldade": "MEDIO"
  }
]`;

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importQuestionsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="whitespace-pre-wrap">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="json">JSON das questões</Label>
        <Textarea
          id="json"
          name="json"
          rows={14}
          placeholder={EXAMPLE}
          className="font-mono text-xs"
          required
        />
        <p className="text-muted-foreground text-xs">
          Array de objetos com <code>materia</code> (slug), <code>enunciado</code>,{" "}
          <code>gabarito</code> (&quot;CERTO&quot;/&quot;ERRADO&quot;), <code>explicacao</code> e{" "}
          <code>dificuldade</code> (FACIL/MEDIO/DIFICIL) — as duas últimas opcionais. Máx. 500 por
          vez.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="publishNow" name="publishNow" />
        <Label htmlFor="publishNow">Publicar imediatamente (sem revisão)</Label>
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Importando..." : "Importar questões"}
      </Button>
    </form>
  );
}
