import "server-only";

import { prisma } from "@/lib/prisma";
import { PDF_BUCKET, createAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess } from "./access";

const SIGNED_URL_TTL_SECONDS = 60; // link expira rápido: baixar na hora

export type PdfItem = {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
};

export type PdfGroup = {
  subjectId: string | null;
  subjectName: string;
  items: PdfItem[];
};

/**
 * PDFs publicados, agrupados por matéria (geral por último).
 *
 * Dentro de cada grupo os gratuitos vêm primeiro: são o que o usuário do
 * plano free realmente consegue abrir, e enterrá-los sob materiais
 * bloqueados faz a biblioteca parecer um paywall inteiro. Só depois é que
 * ordena por mais recente.
 */
export async function listPdfs(): Promise<PdfGroup[]> {
  const pdfs = await prisma.pdfResource.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ isPremium: "asc" }, { createdAt: "desc" }],
    include: { subject: { select: { id: true, name: true, order: true } } },
  });

  const groups = new Map<string, { name: string; order: number; items: PdfItem[] }>();
  for (const pdf of pdfs) {
    const key = pdf.subject?.id ?? "geral";
    const name = pdf.subject?.name ?? "Materiais gerais";
    const order = pdf.subject?.order ?? 9999;
    const group = groups.get(key) ?? { name, order, items: [] };
    group.items.push({
      id: pdf.id,
      title: pdf.title,
      description: pdf.description,
      isPremium: pdf.isPremium,
    });
    groups.set(key, group);
  }

  return [...groups.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, group]) => ({
      subjectId: key === "geral" ? null : key,
      subjectName: group.name,
      items: group.items,
    }));
}

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; reason: "not_found" | "blocked_premium" | "storage_error" };

/**
 * Gera signed URL de curta duração APÓS validar o gate premium.
 * PDF free: liberado a qualquer autenticado. PDF premium: só com acesso pago.
 * A URL nunca é pública — o bucket é privado.
 */
export async function getPdfDownloadUrl(userId: string, pdfId: string): Promise<DownloadResult> {
  const pdf = await prisma.pdfResource.findFirst({
    where: { id: pdfId, isPublished: true, deletedAt: null },
  });
  if (!pdf) return { ok: false, reason: "not_found" };

  if (pdf.isPremium) {
    const allowed = await hasPaidAccess(userId);
    if (!allowed) return { ok: false, reason: "blocked_premium" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .createSignedUrl(pdf.storagePath, SIGNED_URL_TTL_SECONDS, { download: true });

  if (error || !data) return { ok: false, reason: "storage_error" };
  return { ok: true, url: data.signedUrl };
}
