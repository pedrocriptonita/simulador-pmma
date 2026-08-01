import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkPaymentForm } from "@/features/admin/payments/components/link-payment-form";
import { dismissPaymentAction } from "@/features/admin/payments/actions";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/services/auth-guard";

export const metadata: Metadata = { title: "Pagamentos pendentes" };

function formatMoney(cents: number | null): string {
  if (cents === null) return "valor não informado";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminPagamentosPage() {
  await requireAdmin();

  const [pendentes, resolvidos] = await Promise.all([
    prisma.unmatchedPayment.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.unmatchedPayment.findMany({
      where: { resolvedAt: { not: null } },
      orderBy: { resolvedAt: "desc" },
      take: 10,
      include: { resolvedUser: { select: { email: true } } },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos pendentes</h1>
        <p className="text-muted-foreground text-sm">
          Pagamentos confirmados pelo provedor cujo e-mail não corresponde a nenhuma conta. O
          cliente já pagou e está sem acesso — vincule à conta correta.
        </p>
      </header>

      {pendentes.length === 0 ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Nenhum pagamento pendente</AlertTitle>
          <AlertDescription>
            Todo pagamento recebido foi associado a uma conta automaticamente.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>
              {pendentes.length} pagamento{pendentes.length > 1 ? "s" : ""} aguardando vinculação
            </AlertTitle>
            <AlertDescription>
              Cada item aqui é um cliente que pagou e não recebeu acesso.
            </AlertDescription>
          </Alert>

          {pendentes.map((pagamento) => (
            <Card key={pagamento.id}>
              <CardHeader className="gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{pagamento.payerEmail}</CardTitle>
                  <Badge variant="outline">{pagamento.event}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {formatMoney(pagamento.amountCents)} · {formatDateTime(pagamento.createdAt)}
                </p>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {pagamento.externalId}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <LinkPaymentForm paymentId={pagamento.id} payerEmail={pagamento.payerEmail} />
                <form
                  action={async () => {
                    "use server";
                    await dismissPaymentAction(pagamento.id);
                  }}
                >
                  <Button variant="ghost" size="sm" type="submit">
                    Descartar sem liberar acesso
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resolvidos.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Resolvidos recentemente</h2>
          <ul className="flex flex-col gap-2">
            {resolvidos.map((pagamento) => (
              <li
                key={pagamento.id}
                className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span>
                  {pagamento.payerEmail}
                  {pagamento.resolvedUser ? ` → ${pagamento.resolvedUser.email}` : " (descartado)"}
                </span>
                <span className="text-xs">
                  {pagamento.resolvedAt ? formatDateTime(pagamento.resolvedAt) : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
