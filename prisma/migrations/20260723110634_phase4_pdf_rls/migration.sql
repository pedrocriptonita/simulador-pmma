-- ============================================================
-- RLS Fase 4 — pdf_resources
-- Escritas (upload/edição/soft delete) acontecem via Prisma
-- (owner, bypassa RLS). Esta policy vale para a API PostgREST:
-- qualquer autenticado enxerga apenas materiais publicados e não
-- deletados. O gate premium (download real) é feito no servidor
-- via signed URL, não pela RLS.
-- ============================================================

CREATE POLICY "pdf_resources_select_published" ON "public"."pdf_resources"
  FOR SELECT TO authenticated
  USING (is_published = true AND deleted_at IS NULL);
