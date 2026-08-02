import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { UploadForm } from "@/features/admin/pdfs/components/upload-form";
import {
  PdfDeleteButton,
  PdfPremiumSwitch,
  PdfPublishSwitch,
} from "@/features/admin/pdfs/components/pdf-row-actions";

export const metadata: Metadata = { title: "Materiais (admin)" };

export default async function AdminMateriaisPage() {
  const [subjects, pdfs] = await Promise.all([
    prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.pdfResource.findMany({
      where: { deletedAt: null },
      // Gratuitos no topo, espelhando a ordem que o aluno vê na biblioteca.
      orderBy: [{ isPremium: "asc" }, { createdAt: "desc" }],
      include: { subject: { select: { name: true } } },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materiais (PDFs)</h1>
        <p className="text-muted-foreground text-sm">
          {pdfs.length} material(is) no bucket privado. Downloads passam por signed URL.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Enviar novo material</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadForm subjects={subjects} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materiais cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {pdfs.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhum material enviado ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Título</TableHead>
                      <TableHead>Matéria</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Zebra em vez de card cinza: o fundo da página já é um
                        cinza claro, então escurecer o card inteiro apagaria a
                        separação de superfície. Alternar a linha é o que de
                        fato faz cada material virar um bloco distinto. */}
                    {pdfs.map((pdf) => (
                      <TableRow key={pdf.id} className="odd:bg-muted/40">
                        <TableCell className="max-w-[320px] py-3">
                          <p className="flex items-center gap-2 text-sm font-medium">
                            <span className="truncate">{pdf.title}</span>
                            {!pdf.isPremium ? (
                              <Badge variant="secondary" className="shrink-0">
                                Grátis
                              </Badge>
                            ) : null}
                          </p>
                          {pdf.description ? (
                            <p className="text-muted-foreground truncate text-xs">
                              {pdf.description}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm">{pdf.subject?.name ?? "Geral"}</TableCell>
                        <TableCell>
                          <PdfPremiumSwitch pdfId={pdf.id} isPremium={pdf.isPremium} />
                        </TableCell>
                        <TableCell>
                          <PdfPublishSwitch pdfId={pdf.id} isPublished={pdf.isPublished} />
                        </TableCell>
                        <TableCell className="text-right">
                          <PdfDeleteButton pdfId={pdf.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
