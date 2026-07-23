"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadPdfAction, type PdfUploadState } from "@/features/admin/pdfs/actions";

type SubjectOption = { id: string; name: string };

const initialState: PdfUploadState = {};

export function UploadForm({ subjects }: { subjects: SubjectOption[] }) {
  const [state, formAction, pending] = useActionState(uploadPdfAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" placeholder="Ex.: Resumo — Crase em 1 página" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subjectId">Matéria</Label>
        <Select name="subjectId" defaultValue="geral">
          <SelectTrigger id="subjectId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Material geral (sem matéria)</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Arquivo PDF (máx. 25 MB)</Label>
        <Input id="file" name="file" type="file" accept="application/pdf" required />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isPremium" name="isPremium" defaultChecked />
        <Label htmlFor="isPremium">Premium (exclusivo do plano pago)</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="isPublished" name="isPublished" defaultChecked />
        <Label htmlFor="isPublished">Publicado (visível na biblioteca)</Label>
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando..." : "Enviar PDF"}
      </Button>
    </form>
  );
}
