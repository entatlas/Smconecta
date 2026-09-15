-- ==========================================
-- SUPABASE SETUP SCRIPT (CONECTA SM)
-- ==========================================
-- Execute este script no SQL Editor do Supabase após rodar "npx prisma db push".
-- Ele vai habilitar RLS, criar as regras de segurança e configurar os Storages.

-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_education" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_languages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "candidate_certificates" ENABLE ROW LEVEL SECURITY;

-- 2. Políticas RLS (Row Level Security)

-- Perfis (Profile): Um usuário pode ler e editar seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" ON "profiles"
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Usuários podem editar seu próprio perfil" ON "profiles"
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Admins podem ver todos os perfis (Aqui precisamos checar se o auth.uid() é admin na tabela profiles)
-- Como isso pode causar recursão infinita, vamos simplificar:
CREATE POLICY "Admins podem ver todos os perfis" ON "profiles"
  FOR SELECT USING (
    (SELECT tipo FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1) = 'ADMIN'
  );

-- Candidatos: Um usuário pode ler e editar seus próprios dados de candidato
CREATE POLICY "Candidatos podem gerenciar seus dados base" ON "candidates"
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins podem ler candidatos" ON "candidates"
  FOR SELECT USING (
    (SELECT tipo FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1) = 'ADMIN'
  );

-- Demais tabelas do Candidato (Educação, Experiência, etc)
-- Aplicaremos a mesma lógica baseada no candidate_id, que liga ao profile_id.
-- Criamos uma função helper para facilitar e melhorar performance das policies.
CREATE OR REPLACE FUNCTION auth_is_candidate_owner(c_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM candidates c
    JOIN profiles p ON c.profile_id = p.id
    WHERE c.id = c_id AND p.auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Aplicando a política usando a função helper
CREATE POLICY "Candidato pode gerenciar educação" ON "candidate_education"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

CREATE POLICY "Candidato pode gerenciar experiências" ON "candidate_experiences"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

CREATE POLICY "Candidato pode gerenciar habilidades" ON "candidate_skills"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

CREATE POLICY "Candidato pode gerenciar idiomas" ON "candidate_languages"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

CREATE POLICY "Candidato pode gerenciar cursos" ON "candidate_courses"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

CREATE POLICY "Candidato pode gerenciar certificados" ON "candidate_certificates"
  FOR ALL USING (auth_is_candidate_owner(candidate_id));

-- 3. Storage Buckets (Fotos e Documentos)
-- Inserir um bucket chamado "talentos" caso não exista
INSERT INTO storage.buckets (id, name, public) 
VALUES ('talentos', 'talentos', false)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: Candidato pode fazer upload na pasta dele
CREATE POLICY "Usuários podem subir seus próprios arquivos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'talentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem ver seus próprios arquivos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'talentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins podem ver todos os arquivos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'talentos' AND 
  (SELECT tipo FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1) = 'ADMIN'
);
