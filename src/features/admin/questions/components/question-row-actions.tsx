"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { deleteQuestionAction, togglePublishAction } from "@/features/admin/questions/actions";

export function PublishSwitch({
  questionId,
  isPublished,
}: {
  questionId: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Switch
      checked={isPublished}
      disabled={pending}
      onCheckedChange={() =>
        startTransition(async () => {
          await togglePublishAction(questionId);
          toast.success(isPublished ? "Questão movida para rascunho." : "Questão publicada.");
        })
      }
      aria-label="Publicar questão"
    />
  );
}

export function RowActions({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/admin/questoes/${questionId}`} aria-label="Editar questão">
          <Pencil className="size-4" />
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Excluir questão">
            <Trash2 className="text-destructive size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir questão?</DialogTitle>
            <DialogDescription>
              A questão sai dos próximos simulados, mas o histórico de quem já a respondeu é
              preservado (soft delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteQuestionAction(questionId);
                  setOpen(false);
                  toast.success("Questão excluída.");
                })
              }
            >
              {pending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
