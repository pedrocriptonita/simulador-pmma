import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isCheckoutConfigured } from "@/lib/billing/config";
import { hasPaidAccess } from "@/services/access";
import { getAuthUser } from "@/services/auth-guard";
import { getPlansCached } from "@/services/catalog";
import { getUserWithPlan } from "@/services/users";
import { startCheckoutAction } from "@/features/billing/actions";

export const metadata: Metadata = { title: "Planos" };

function formatPrice(priceCents: number): string {
  return (priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FREE_FEATURES = ["1 simulado por semana", "Correção com nota líquida", "PDFs gratuitos"];
const PAID_FEATURES = [
  "Simulados ilimitados até a prova",
  "Correção Cebraspe com gabarito comentado",
  "Dashboard completo de desempenho",
  "Todos os PDFs de resumo",
  "Acesso garantido até 11/10/2026",
];

export default async function PlanosPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string; erro?: string }>;
}) {
  const { motivo, erro } = await searchParams;

  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const [plans, user, paid] = await Promise.all([
    getPlansCached(),
    getUserWithPlan(authUser.id),
    hasPaidAccess(authUser.id),
  ]);
  const paidPlan = plans.find((plan) => plan.slug === "ate-a-prova") ?? null;

  const checkoutOn = isCheckoutConfigured();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      {motivo === "limite" ? (
        <Alert>
          <AlertTitle>Você já usou seu simulado grátis desta semana</AlertTitle>
          <AlertDescription>
            Não pare o ritmo agora — a prova é em 11/10/2026. Destrave simulados ilimitados com o
            plano até a prova.
          </AlertDescription>
        </Alert>
      ) : null}
      {motivo === "expirado" ? (
        <Alert>
          <AlertTitle>Seu acesso expirou</AlertTitle>
          <AlertDescription>Renove para continuar treinando até a prova.</AlertDescription>
        </Alert>
      ) : null}
      {motivo === "premium" ? (
        <Alert>
          <AlertTitle>Material exclusivo do plano até a prova</AlertTitle>
          <AlertDescription>
            Libere todos os PDFs de resumo e os simulados ilimitados com o plano abaixo.
          </AlertDescription>
        </Alert>
      ) : null}
      {erro === "checkout_indisponivel" ? (
        <Alert variant="destructive">
          <AlertTitle>Pagamento indisponível no momento</AlertTitle>
          <AlertDescription>Tente novamente em instantes.</AlertDescription>
        </Alert>
      ) : null}

      {paid ? (
        <Alert>
          <ShieldCheck />
          <AlertTitle>Você já tem acesso completo</AlertTitle>
          <AlertDescription>
            Seu plano está ativo
            {user?.accessExpiresAt
              ? ` até ${user.accessExpiresAt.toLocaleDateString("pt-BR")}`
              : ""}
            . Bons estudos!
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Escolha seu plano</h1>
        <p className="text-muted-foreground text-sm">
          Pagamento único, sem mensalidade. Acesso até o dia da prova.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gratuito</CardTitle>
            <CardDescription>Para sentir o formato da prova</CardDescription>
            <p className="text-3xl font-bold">R$ 0</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {FREE_FEATURES.map((feature) => (
              <p key={feature} className="flex items-center gap-2 text-sm">
                <Check className="text-muted-foreground size-4" /> {feature}
              </p>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/simulados/novo">Continuar no gratuito</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paidPlan?.name ?? "Acesso até a Prova"}
              <Badge>Recomendado</Badge>
            </CardTitle>
            <CardDescription>
              {paidPlan?.description ?? "Tudo liberado até 11/10/2026"}
            </CardDescription>
            <p className="text-3xl font-bold">
              {formatPrice(paidPlan?.priceCents ?? 3990)}
              <span className="text-muted-foreground text-sm font-normal"> · pagamento único</span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {PAID_FEATURES.map((feature) => (
              <p key={feature} className="flex items-center gap-2 text-sm">
                <Check className="text-primary size-4" /> {feature}
              </p>
            ))}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            {paid ? (
              <Button className="w-full" size="lg" disabled>
                Acesso já liberado
              </Button>
            ) : checkoutOn ? (
              <form action={startCheckoutAction} className="w-full">
                <Button className="w-full" size="lg" type="submit">
                  Assinar agora
                </Button>
              </form>
            ) : (
              <>
                <Button className="w-full" size="lg" disabled>
                  Assinar (checkout em configuração)
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  O botão será ativado assim que o provedor de pagamento estiver conectado.
                </p>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
