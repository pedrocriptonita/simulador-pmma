import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <Badge variant="secondary">Edital nº 1 — PMMA/2026 · Prova em 11/10/2026</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simulador PM MA 2026</h1>
        <p className="text-muted-foreground text-lg">
          Treine no formato real do Cebraspe: Certo/Errado com penalização e nota líquida. Descubra
          onde você realmente está antes da prova.
        </p>
        <Button size="lg" disabled>
          Em breve — plataforma em construção
        </Button>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nota líquida real</CardTitle>
            <CardDescription>
              Cada erro anula um acerto, exatamente como na correção do Cebraspe.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnóstico por matéria</CardTitle>
            <CardDescription>
              Saiba em quais matérias do edital focar seu tempo até 11/10.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumos em PDF</CardTitle>
            <CardDescription>
              Material objetivo por matéria para revisar em qualquer lugar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="w-full max-w-3xl">
        <CardContent className="text-muted-foreground pt-6 text-center text-sm">
          1.000 vagas · Soldado PM MA · Salário inicial R$ 6.149,08
        </CardContent>
      </Card>
    </main>
  );
}
