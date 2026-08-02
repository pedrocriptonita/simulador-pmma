import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasPaidAccess } from "@/services/access";
import { getAuthUser } from "@/services/auth-guard";
import { listPdfs } from "@/services/pdfs";

export const metadata: Metadata = { title: "Materiais" };

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const { erro } = await searchParams;
  const [groups, paid] = await Promise.all([listPdfs(), hasPaidAccess(authUser.id)]);

  const totalPdfs = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materiais de estudo</h1>
        <p className="text-muted-foreground text-sm">
          Resumos objetivos em PDF por matéria do edital.
        </p>
      </div>

      {erro === "indisponivel" ? (
        <Card className="border-destructive/30">
          <CardContent className="text-destructive pt-6 text-sm">
            Este material está indisponível no momento. Tente novamente mais tarde.
          </CardContent>
        </Card>
      ) : null}

      {!paid ? (
        <Card className="border-primary/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm">
              Materiais com selo <Badge variant="secondary">Premium</Badge> são exclusivos do plano
              até a prova.
            </p>
            <Button size="sm" asChild>
              <Link href="/planos?motivo=premium">Liberar tudo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {totalPdfs === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Ainda não há materiais publicados. Em breve novos resumos por matéria.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.subjectId ?? "geral"} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{group.subjectName}</h2>
              <div className="flex flex-col gap-2">
                {group.items.map((pdf) => {
                  const locked = pdf.isPremium && !paid;
                  return (
                    <Card
                      key={pdf.id}
                      /* Material aberto ganha borda de destaque: é o que o
                         usuário do plano free consegue abrir agora, e some no
                         meio dos bloqueados se não tiver marcação. */
                      className={!pdf.isPremium ? "border-primary/40" : undefined}
                    >
                      <CardContent className="flex items-center justify-between gap-4 pt-6">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {pdf.title}
                            {pdf.isPremium ? (
                              <Badge variant="secondary">Premium</Badge>
                            ) : (
                              <Badge>Grátis</Badge>
                            )}
                          </p>
                          {pdf.description ? (
                            <p className="text-muted-foreground line-clamp-2 text-sm">
                              {pdf.description}
                            </p>
                          ) : null}
                        </div>
                        {locked ? (
                          <Button variant="outline" size="sm" className="shrink-0" asChild>
                            <Link href="/planos?motivo=premium">
                              <Lock className="size-4" /> Desbloquear
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" className="shrink-0" asChild>
                            {/* Download passa pelo route handler que valida o acesso */}
                            <a href={`/materiais/${pdf.id}/download`}>
                              <Download className="size-4" /> Baixar
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
