-- ============================================================
-- RLS Fase 3 — questions, exams, exam_answers
-- Escritas de admin acontecem via Prisma (owner, bypassa RLS).
-- Estas policies valem para a API PostgREST (anon/authenticated).
-- ============================================================

-- questions: usuário autenticado lê apenas questões publicadas e não deletadas
CREATE POLICY "questions_select_published" ON "public"."questions"
  FOR SELECT TO authenticated
  USING (is_published = true AND deleted_at IS NULL);

-- exams: usuário lê/escreve apenas os próprios simulados
CREATE POLICY "exams_select_own" ON "public"."exams"
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "exams_insert_own" ON "public"."exams"
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "exams_update_own" ON "public"."exams"
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- exam_answers: acesso via posse do exam pai
CREATE POLICY "exam_answers_select_own" ON "public"."exam_answers"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."exams" e
      WHERE e.id = exam_id AND e.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "exam_answers_insert_own" ON "public"."exam_answers"
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."exams" e
      WHERE e.id = exam_id AND e.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "exam_answers_update_own" ON "public"."exam_answers"
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."exams" e
      WHERE e.id = exam_id AND e.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."exams" e
      WHERE e.id = exam_id AND e.user_id = (SELECT auth.uid())
    )
  );
