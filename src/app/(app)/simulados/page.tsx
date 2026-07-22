import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/services/auth-guard";
import { listUserExams } from "@/services/exams";

export const metadata: Metadata = { title: "Meus simulados" };

const STATUS_LABEL: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  IN_PROGRESS: { label: "Em andamento", variant: "outline" },
  COMPLETED: { label: "Concluído", variant: "default" },
  ABANDONED: { label: "Abandonado", variant: "secondary" },
};

export default async function SimuladosPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const exams = await listUserExams(authUser.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus simulados</h1>
          <p className="text-muted-foreground text-sm">Histórico e evolução das suas notas.</p>
        </div>
        <Button asChild>
          <Link href="/simulados/novo">Novo simulado</Link>
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="text-lg">Você ainda não fez nenhum simulado</CardTitle>
            <CardDescription>
              Comece agora e descubra sua nota líquida no formato real do Cebraspe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/simulados/novo">Fazer meu primeiro simulado</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {exams.map((exam) => {
            const status = STATUS_LABEL[exam.status] ?? STATUS_LABEL.COMPLETED!;
            const href =
              exam.status === "IN_PROGRESS"
                ? `/simulados/${exam.id}`
                : `/simulados/${exam.id}/resultado`;
            return (
              <Link key={exam.id} href={href} className="group">
                <Card className="group-hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center justify-between gap-4 pt-6">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {exam.title ?? (exam.subject ? exam.subject.name : "Simulado")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {exam.createdAt.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        · {exam.totalQuestions ?? "—"} questões
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {exam.status === "COMPLETED" && exam.scoreNet !== null ? (
                        <span className="text-xl font-bold tabular-nums">
                          {exam.scoreNet > 0 ? "+" : ""}
                          {exam.scoreNet}
                        </span>
                      ) : null}
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
