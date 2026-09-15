-- Ativar RLS nas novas tabelas do módulo educacional (Prompt 05)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 1. Políticas Públicas / Leitura
CREATE POLICY "Qualquer pessoa logada pode ver cursos publicados" 
ON courses FOR SELECT USING (status = 'PUBLISHED' AND auth.uid() IS NOT NULL);

CREATE POLICY "Qualquer pessoa logada pode ver modulos de cursos publicados" 
ON course_modules FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Qualquer pessoa logada pode ver aulas" 
ON course_lessons FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. Matrículas (CourseEnrollments)
CREATE POLICY "Candidatos podem ver suas próprias matrículas" 
ON course_enrollments FOR SELECT USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Candidatos podem criar suas próprias matrículas" 
ON course_enrollments FOR INSERT WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  )
);

-- 3. Progresso e Tentativas
CREATE POLICY "Candidatos gerenciam seu proprio progresso" 
ON lesson_progress FOR ALL USING (
  enrollment_id IN (
    SELECT id FROM course_enrollments WHERE candidate_id IN (
      SELECT id FROM candidates WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  )
);

-- 4. Função e Trigger para Inserir Certificado no Currículo automaticamente
CREATE OR REPLACE FUNCTION add_certificate_to_candidate_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_course_name text;
  v_instructor_name text;
  v_workload int;
BEGIN
  -- Se o status do certificado mudar para VALID ou for inserido como VALID
  IF NEW.status = 'VALID' THEN
    -- Obter dados do curso
    SELECT title, workload_hours INTO v_course_name, v_workload FROM courses WHERE id = NEW.course_id;
    
    -- Inserir na tabela candidate_courses (Currículo/Banco de Talentos)
    INSERT INTO candidate_courses (id, candidate_id, name, institution, workload, end_date, certificate_url, updated_at)
    VALUES (
      gen_random_uuid(),
      NEW.candidate_id,
      v_course_name,
      'Conecta SM / Parceiros',
      v_workload,
      NEW.completion_date,
      NEW.file_url,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_add_certificate ON certificates;
CREATE TRIGGER trigger_add_certificate
AFTER INSERT OR UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION add_certificate_to_candidate_profile();
