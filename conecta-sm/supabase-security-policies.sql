-- --------------------------------------------------------------------------------------
-- SEGURANÇA E RLS: SCRIPT DE IMPLEMENTAÇÃO (PROMPT 12)
-- Execute este script no SQL Editor do Supabase para reforçar a segurança no banco.
-- --------------------------------------------------------------------------------------

-- 1. Tabela: CANDIDATES
ALTER TABLE "candidates" ENABLE ROW LEVEL SECURITY;

-- Política: Candidatos podem visualizar seu próprio perfil
DROP POLICY IF EXISTS "Candidates can view their own profile" ON "candidates";
CREATE POLICY "Candidates can view their own profile"
ON "candidates"
FOR SELECT
USING (
  "profile_id" IN (
    SELECT id FROM "profiles" WHERE auth_user_id = auth.uid()
  )
);

-- Política: Candidatos podem editar seu próprio perfil
DROP POLICY IF EXISTS "Candidates can update their own profile" ON "candidates";
CREATE POLICY "Candidates can update their own profile"
ON "candidates"
FOR UPDATE
USING (
  "profile_id" IN (
    SELECT id FROM "profiles" WHERE auth_user_id = auth.uid()
  )
);

-- Política: Administradores e Empresas (após candidatura) podem ver perfil público.
-- Aqui liberamos leitura geral (se 'visibility' for PUBLIC) ou para ADMINS.
DROP POLICY IF EXISTS "Admins and general public read based on visibility" ON "candidates";
CREATE POLICY "Admins and general public read based on visibility"
ON "candidates"
FOR SELECT
USING (
  "visibility" = 'PUBLIC'
  OR 
  (SELECT tipo FROM "profiles" WHERE auth_user_id = auth.uid()) = 'ADMIN'
);

-- --------------------------------------------------------------------------------------

-- 2. Tabela: COMPANIES
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;

-- Política: Empresas podem visualizar sua própria conta
DROP POLICY IF EXISTS "Companies can view their own profile" ON "companies";
CREATE POLICY "Companies can view their own profile"
ON "companies"
FOR SELECT
USING (
  "profile_id" IN (
    SELECT id FROM "profiles" WHERE auth_user_id = auth.uid()
  )
);

-- Política: Empresas podem atualizar sua própria conta
DROP POLICY IF EXISTS "Companies can update their own profile" ON "companies";
CREATE POLICY "Companies can update their own profile"
ON "companies"
FOR UPDATE
USING (
  "profile_id" IN (
    SELECT id FROM "profiles" WHERE auth_user_id = auth.uid()
  )
);

-- Política: Candidatos e público geral podem visualizar dados públicos de empresas
DROP POLICY IF EXISTS "Public can view active companies" ON "companies";
CREATE POLICY "Public can view active companies"
ON "companies"
FOR SELECT
USING (
  true -- Dependendo do projeto, a leitura de empresa é pública (para vagas)
);

-- --------------------------------------------------------------------------------------

-- 3. Tabela: FINANCIAL_TRANSACTIONS
ALTER TABLE "financial_transactions" ENABLE ROW LEVEL SECURITY;

-- Política: SOMENTE ADMINS PODEM VER/EDITAR
DROP POLICY IF EXISTS "Only Admins can access financial data" ON "financial_transactions";
CREATE POLICY "Only Admins can access financial data"
ON "financial_transactions"
FOR ALL
USING (
  (SELECT tipo FROM "profiles" WHERE auth_user_id = auth.uid()) = 'ADMIN'
);

-- --------------------------------------------------------------------------------------

-- 4. Tabela: AUDIT_LOGS
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Política: Audit logs são imutáveis e legíveis apenas por admin
DROP POLICY IF EXISTS "Only Admins can read audit logs" ON "audit_logs";
CREATE POLICY "Only Admins can read audit logs"
ON "audit_logs"
FOR SELECT
USING (
  (SELECT tipo FROM "profiles" WHERE auth_user_id = auth.uid()) = 'ADMIN'
);

-- Não criamos política de DELETE/UPDATE para garantir a imutabilidade do audit pelo cliente.
-- Insert pode ser feito pela API (bypass RLS se usar server service role) ou liberado:
DROP POLICY IF EXISTS "Anyone can insert audit log" ON "audit_logs";
CREATE POLICY "Anyone can insert audit log"
ON "audit_logs"
FOR INSERT
WITH CHECK (true);

-- --------------------------------------------------------------------------------------
-- Dica: Em um ambiente de produção real, o backend Next.js (via Prisma) geralmente
-- opera em modo "bypass RLS" porque usa a string de conexão direta do PostgreSQL 
-- (POSTGRES_URL). O RLS acima protege primariamente conexões via Supabase Client (Anon/Auth Key).
-- Como a API está sendo solidificada com validações `requireRole()`, temos a segurança dupla exigida!
