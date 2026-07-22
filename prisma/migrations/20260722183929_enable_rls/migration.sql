-- ============================================================
-- RLS (Row Level Security) — Fase 2
-- O Prisma conecta como owner das tabelas (bypassa RLS), então
-- estas policies protegem o acesso via API auto-gerada do
-- Supabase (PostgREST) com as roles anon / authenticated.
-- Regra: tudo habilitado; sem policy = acesso negado.
-- ============================================================

-- A shadow database do Prisma não possui o schema auth do Supabase.
-- Stub inofensivo: no banco real auth.uid() já existe e nada é alterado.
CREATE SCHEMA IF NOT EXISTS "auth";
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULL::uuid $f$';
  END IF;
END
$$;

ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."exam_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pdf_resources" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- users: usuário autenticado lê/atualiza apenas a própria linha
-- ------------------------------------------------------------
CREATE POLICY "users_select_own" ON "public"."users"
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_update_own" ON "public"."users"
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ------------------------------------------------------------
-- plans / subjects: catálogo, leitura pública (anon incluso)
-- ------------------------------------------------------------
CREATE POLICY "plans_public_read" ON "public"."plans"
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "subjects_public_read" ON "public"."subjects"
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ------------------------------------------------------------
-- questions, exams, exam_answers, purchases, pdf_resources:
-- sem policies nesta fase => negadas por padrão via PostgREST.
-- Policies específicas chegam nas Fases 3 e 4.
-- ------------------------------------------------------------
