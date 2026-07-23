"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import {
  deletePdfAction,
  togglePdfPremiumAction,
  togglePdfPublishAction,
} from "@/features/admin/pdfs/actions";

export function PdfPublishSwitch({ pdfId, isPublished }: { pdfId: string; isPublished: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Switch
      checked={isPublished}
      disabled={pending}
      onCheckedChange={() =>
        startTransition(async () => {
          await togglePdfPublishAction(pdfId);
          toast.success(isPublished ? "Material despublicado." : "Material publicado.");
        })
      }
      aria-label="Publicar material"
    />
  );
}

export function PdfPremiumSwitch({ pdfId, isPremium }: { pdfId: string; isPremium: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Switch
      checked={isPremium}
      disabled={pending}
      onCheckedChange={() =>
        startTransition(async () => {
          await togglePdfPremiumAction(pdfId);
          toast.success(
            isPremium ? "Material liberado no plano free." : "Material marcado como premium.",
          );
        })
      }
      aria-label="Marcar como premium"
    />
  );
}

export function PdfDeleteButton({ pdfId }: { pdfId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Excluir material">
          <Trash2 className="text-destructive size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir material?</DialogTitle>
          <DialogDescription>
            O PDF sai da biblioteca e o arquivo é removido do armazenamento. Esta ação não pode ser
            desfeita.
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
                await deletePdfAction(pdfId);
                setOpen(false);
                toast.success("Material excluído.");
              })
            }
          >
            {pending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
