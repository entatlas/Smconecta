-- ==========================================
-- SUPABASE SETUP SCRIPT (VAGAS E CANDIDATURAS)
-- ==========================================

-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "application_history" ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para Jobs (Vagas)

-- Candidatos (qualquer usuário autenticado) podem VER as vagas PUBLICADAS
CREATE POLICY "Candidatos podem ver vagas publicadas" ON "jobs"
  FOR SELECT USING (status = 'PUBLISHED' OR status = 'CLOSED');

-- Empresas podem gerenciar (inserir/editar/ver) SUAS PRÓPRIAS vagas
CREATE POLICY "Empresas gerenciam suas proprias vagas" ON "jobs"
  FOR ALL USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN profiles p ON c.profile_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Admins podem gerenciar todas as vagas
CREATE POLICY "Admins gerenciam todas as vagas" ON "jobs"
  FOR ALL USING (
    (SELECT tipo FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1) = 'ADMIN'
  );

-- Job Skills (Empresas gerenciam as competências de suas próprias vagas, Candidatos podem ver)
CREATE POLICY "Todos podem ver skills das vagas" ON "job_skills"
  FOR SELECT USING (true);

CREATE POLICY "Empresas gerenciam skills das vagas" ON "job_skills"
  FOR ALL USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id IN (
        SELECT c.id FROM companies c
        JOIN profiles p ON c.profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
      )
    )
  );


-- 3. Políticas para Applications (Candidaturas)

-- Candidato pode VER e INSERIR (se candidatar) a si mesmo
CREATE POLICY "Candidato gerencia suas candidaturas" ON "applications"
  FOR ALL USING (
    candidate_id IN (
      SELECT c.id FROM candidates c
      JOIN profiles p ON c.profile_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Empresa pode VER e EDITAR (status) as candidaturas DAS SUAS VAGAS
CREATE POLICY "Empresa gerencia candidaturas de suas vagas" ON "applications"
  FOR ALL USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id IN (
        SELECT c.id FROM companies c
        JOIN profiles p ON c.profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
      )
    )
  );

-- Admins gerenciam candidaturas globais
CREATE POLICY "Admins gerenciam candidaturas" ON "applications"
  FOR ALL USING (
    (SELECT tipo FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1) = 'ADMIN'
  );


-- 4. Application History
-- Todos envolvidos podem ver o histórico.
CREATE POLICY "Candidato pode ver histórico de sua candidatura" ON "application_history"
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE candidate_id IN (
        SELECT c.id FROM candidates c JOIN profiles p ON c.profile_id = p.id WHERE p.auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Empresa pode ver historico de candidatura da sua vaga" ON "application_history"
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE job_id IN (
        SELECT id FROM jobs WHERE company_id IN (
          SELECT c.id FROM companies c JOIN profiles p ON c.profile_id = p.id WHERE p.auth_user_id = auth.uid()
        )
      )
    )
  );
  
CREATE POLICY "Empresa pode inserir historico" ON "application_history"
  FOR INSERT WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE job_id IN (
        SELECT id FROM jobs WHERE company_id IN (
          SELECT c.id FROM companies c JOIN profiles p ON c.profile_id = p.id WHERE p.auth_user_id = auth.uid()
        )
      )
    )
  );
