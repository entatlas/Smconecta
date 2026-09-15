-- Script para aplicar Row Level Security (RLS) nas novas tabelas do Financeiro

-- Habilitando RLS
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_logs ENABLE ROW LEVEL SECURITY;

-- Por enquanto, concederemos acesso total aos administradores e bloquearemos os demais
-- Isso simplifica a MVP e garante segurança (regra de não expor dados financeiros para perfis não autorizados)

-- Regras para financial_categories
CREATE POLICY "Admins can do everything on financial_categories" 
ON financial_categories FOR ALL 
USING (
  auth.uid() IN (SELECT auth_user_id FROM profiles WHERE tipo = 'ADMIN')
);

-- Regras para cost_centers
CREATE POLICY "Admins can do everything on cost_centers" 
ON cost_centers FOR ALL 
USING (
  auth.uid() IN (SELECT auth_user_id FROM profiles WHERE tipo = 'ADMIN')
);

-- Regras para financial_transactions
CREATE POLICY "Admins can do everything on financial_transactions" 
ON financial_transactions FOR ALL 
USING (
  auth.uid() IN (SELECT auth_user_id FROM profiles WHERE tipo = 'ADMIN')
);

-- Regras para financial_attachments
CREATE POLICY "Admins can do everything on financial_attachments" 
ON financial_attachments FOR ALL 
USING (
  auth.uid() IN (SELECT auth_user_id FROM profiles WHERE tipo = 'ADMIN')
);

-- Regras para financial_audit_logs
CREATE POLICY "Admins can do everything on financial_audit_logs" 
ON financial_audit_logs FOR ALL 
USING (
  auth.uid() IN (SELECT auth_user_id FROM profiles WHERE tipo = 'ADMIN')
);

-- Garantir que a Role "authenticated" e "anon" (público) NÃO podem acessar caso não sejam admin
-- (Isso já acontece por padrão quando o RLS é ativado e só políticas para admins são criadas)
