-- Bloqueando totalmente o acesso público ou de usuários normais (CANDIDATE / COMPANY) às tabelas do CRM
-- Habilitar RLS em todas as tabelas CRM

ALTER TABLE crm_candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_history ENABLE ROW LEVEL SECURITY;

-- 1. Políticas restritivas: SOMENTE usuários com o tipo 'ADMIN' no perfil poderão acessar.

CREATE POLICY "Admin All Access crm_candidate_profiles" 
ON crm_candidate_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access crm_company_profiles" 
ON crm_company_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access crm_interactions" 
ON crm_interactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access crm_tasks" 
ON crm_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access crm_notes" 
ON crm_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access company_contacts" 
ON company_contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

-- EXCEÇÃO: A tabela professional_history precisa ser escrita via Triggers (que rodam como postgres) 
-- e pode precisar ser lida pelo CANDIDATE dono.
CREATE POLICY "Admin All Access professional_history" 
ON professional_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Candidato pode ler seu proprio historico profissional" 
ON professional_history FOR SELECT USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  )
);
