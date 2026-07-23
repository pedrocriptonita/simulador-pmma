"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PDF_BUCKET, createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/services/auth-guard";

export type PdfUploadState = { error?: string; success?: string };

const MAX_BYTES = 25 * 1024 * 1024;

export async function uploadPdfAction(
  _prev: PdfUploadState,
  formData: FormData,
): Promise<PdfUploadState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const isPublished = formData.get("isPublished") === "on";
  const file = formData.get("file");

  if (title.length < 3) return { error: "Informe um título com pelo menos 3 caracteres." };
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo PDF." };
  if (file.type !== "application/pdf") return { error: "O arquivo deve ser um PDF." };
  if (file.size > MAX_BYTES) return { error: "O PDF excede o limite de 25 MB." };

  // subjectId vazio ou "geral" => material sem matéria
  let resolvedSubjectId: string | null = null;
  let subjectSlug = "geral";
  if (subjectId && subjectId !== "geral") {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, deletedAt: null },
    });
    if (!subject) return { error: "Matéria inválida." };
    resolvedSubjectId = subject.id;
    subjectSlug = subject.slug;
  }

  const storagePath = `${subjectSlug}/${randomUUID()}.pdf`;
  const supabase = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) {
    return { error: `Falha no upload: ${uploadError.message}` };
  }

  await prisma.pdfResource.create({
    data: {
      title,
      description: description || null,
      subjectId: resolvedSubjectId,
      storagePath,
      isPremium,
      isPublished,
    },
  });

  revalidatePath("/admin/materiais");
  redirect("/admin/materiais");
}

export async function togglePdfPublishAction(pdfId: string): Promise<void> {
  await requireAdmin();
  const pdf = await prisma.pdfResource.findFirst({ where: { id: pdfId, deletedAt: null } });
  if (!pdf) return;
  await prisma.pdfResource.update({
    where: { id: pdfId },
    data: { isPublished: !pdf.isPublished },
  });
  revalidatePath("/admin/materiais");
}

export async function togglePdfPremiumAction(pdfId: string): Promise<void> {
  await requireAdmin();
  const pdf = await prisma.pdfResource.findFirst({ where: { id: pdfId, deletedAt: null } });
  if (!pdf) return;
  await prisma.pdfResource.update({
    where: { id: pdfId },
    data: { isPremium: !pdf.isPremium },
  });
  revalidatePath("/admin/materiais");
}

export async function deletePdfAction(pdfId: string): Promise<void> {
  await requireAdmin();
  // Soft delete no registro + remoção do arquivo no Storage (economia de espaço)
  const pdf = await prisma.pdfResource.findFirst({ where: { id: pdfId, deletedAt: null } });
  if (!pdf) return;

  const supabase = createAdminClient();
  await supabase.storage.from(PDF_BUCKET).remove([pdf.storagePath]);

  await prisma.pdfResource.update({
    where: { id: pdfId },
    data: { deletedAt: new Date(), isPublished: false },
  });
  revalidatePath("/admin/materiais");
}
