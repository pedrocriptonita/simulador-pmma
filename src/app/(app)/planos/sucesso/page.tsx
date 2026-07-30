import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseTracker } from "@/components/analytics/purchase-tracker";
import { getLatestPaidPurchase, hasPaidAccess } from "@/services/access";
import { getAuthUser } from "@/services/auth-guard";

export const metadata: Metadata = { title: "Compra concluída" };

/**
 * Tela pós-compra (roadmap 6.4). O webhook processa o pagamento de forma
 * assíncrona, então o acesso pode levar alguns segundos para refletir.
 */
export default async function CheckoutSucessoPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const paid = await hasPaidAccess(authUser.id);
  const purchase = paid ? await getLatestPaidPurchase(authUser.id) : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-16">
      {purchase && authUser.email ? (
        <PurchaseTracker
          transactionId={purchase.externalId ?? purchase.id}
          value={purchase.amountCents / 100}
          email={authUser.email}
        />
      ) : null}
      <Card>
        <CardHeader className="items-center text-center">
          {paid ? (
            <>
              <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
                <PartyPopper className="size-7" />
              </div>
              <CardTitle className="text-xl">Acesso liberado!</CardTitle>
              <CardDescription>
                Seu pagamento foi confirmado e você já tem acesso completo até a prova de
                11/10/2026. Bora treinar.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
                <Clock className="size-7" />
              </div>
              <CardTitle className="text-xl">Estamos confirmando seu pagamento</CardTitle>
              <CardDescription>
                Recebemos sua compra. A confirmação pode levar alguns segundos. Atualize esta página
                em instantes — assim que aprovada, seu acesso é liberado automaticamente.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          {paid ? (
            <Button size="lg" asChild>
              <Link href="/simulados/novo">Fazer um simulado agora</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/planos/sucesso">Atualizar status</Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Ir para o dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
