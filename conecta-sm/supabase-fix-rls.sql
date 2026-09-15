-- Correção RLS para permitir INSERT no momento do cadastro
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON "profiles"
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Candidatos podem inserir seu registro" ON "candidates"
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Empresas podem inserir seu registro" ON "companies"
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );
