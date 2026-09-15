-- Bloqueando totalmente o acesso público às tabelas de Calendário
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_links ENABLE ROW LEVEL SECURITY;

-- 1. Políticas ADMIN (Acesso total)
CREATE POLICY "Admin All Access calendar_events" 
ON calendar_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access calendar_event_participants" 
ON calendar_event_participants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access calendar_event_reminders" 
ON calendar_event_reminders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

CREATE POLICY "Admin All Access calendar_event_links" 
ON calendar_event_links FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND tipo = 'ADMIN')
);

-- 2. Políticas CANDIDATO
-- Candidato pode ver o evento SE ele for um participante
CREATE POLICY "Candidato ve eventos onde participa" 
ON calendar_events FOR SELECT USING (
  id IN (
    SELECT event_id FROM calendar_event_participants WHERE user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Candidato pode atualizar status de presenca" 
ON calendar_event_participants FOR UPDATE USING (
  user_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  )
);

-- 3. Políticas EMPRESA
-- Empresa pode ver eventos que estao linkados a ela ou que um dos seus colaboradores seja participante
CREATE POLICY "Empresa ve eventos relacionados a ela" 
ON calendar_events FOR SELECT USING (
  id IN (
    SELECT event_id FROM calendar_event_links WHERE company_id IN (
      SELECT id FROM companies WHERE id IN (
        SELECT company_id FROM company_contacts WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  )
);
