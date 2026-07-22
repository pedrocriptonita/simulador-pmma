import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImportForm } from "@/features/admin/questions/components/import-form";

export const metadata: Metadata = { title: "Importar questões" };

export default function ImportarQuestoesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Importar questões (JSON)</h1>
          <p className="text-muted-foreground text-sm">
            Cole o lote gerado por IA já revisado para carga rápida no banco.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/questoes">Voltar</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ImportForm />
        </CardContent>
      </Card>
    </main>
  );
}
