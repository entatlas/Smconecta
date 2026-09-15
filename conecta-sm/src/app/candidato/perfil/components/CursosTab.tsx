'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '../Perfil.module.css';

export default function CursosTab() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  // Form states
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [workload, setWorkload] = useState('');
  const [endDate, setEndDate] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  useEffect(() => {
    loadCursos();
  }, [supabase]);

  async function loadCursos() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
    if (!profile) {
      setLoading(false);
      return;
    }

    const { data: candidate } = await supabase.from('candidates').select('id').eq('profile_id', profile.id).single();
    if (!candidate) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.from('candidate_courses').select('*').eq('candidate_id', candidate.id).order('end_date', { ascending: false });
    if (data) setCursos(data);
    setLoading(false);
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
    if (!profile) return;
    const { data: candidate } = await supabase.from('candidates').select('id').eq('profile_id', profile.id).single();

    if (!candidate) {
      alert("Por favor, preencha e salve seus 'Dados Pessoais' primeiro para criar seu perfil.");
      return;
    }

    const workloadInt = workload ? parseInt(workload, 10) : null;

    const { error } = await supabase.from('candidate_courses').insert({
      id: crypto.randomUUID(),
      candidate_id: candidate.id,
      name,
      institution,
      workload: workloadInt,
      certificate_url: certificateUrl || null,
      end_date: endDate ? new Date(endDate).toISOString() : null
    });

    if (error) {
      alert("Erro ao salvar curso: " + error.message);
      console.error(error);
      return;
    }
    
    setIsAdding(false);
    setName('');
    setInstitution('');
    setWorkload('');
    setEndDate('');
    setCertificateUrl('');
    loadCursos();
    window.dispatchEvent(new Event('profile-updated'));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('candidate_courses').delete().eq('id', id);
    loadCursos();
    window.dispatchEvent(new Event('profile-updated'));
  };

  if (loading) return (
    <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: '#8B9BB4' }}>Carregando cursos...</p>
    </div>
  );

  return (
    <div className={styles.mainCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className={styles.sectionTitle}>Cursos Complementares</h2>
          <p className={styles.sectionDesc} style={{ marginBottom: 0 }}>
            Adicione cursos livres, workshops e treinamentos.
          </p>
        </div>
        {!isAdding && (
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Adicionar Curso
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '2.5rem' }}>
          <h3 className={styles.formGroupTitle} style={{ borderBottom: 'none', marginBottom: '1.5rem', fontSize: '1.1rem', color: '#FFF' }}>Novo Curso</h3>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <Input label="Nome do Curso" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Instituição" value={institution} onChange={e => setInstitution(e.target.value)} />
          </div>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <Input label="Carga Horária (horas)" type="number" value={workload} onChange={e => setWorkload(e.target.value)} placeholder="Ex: 40" />
            <Input label="Data de Conclusão" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '0.5rem' }}>Certificado (Opcional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="file" 
                id="curso-cert-upload" 
                accept="image/*,.pdf" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  if (file.size > 5 * 1024 * 1024) {
                    alert('O arquivo deve ter no máximo 5MB.');
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setCertificateUrl(event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <label htmlFor="curso-cert-upload" className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
                Selecionar Arquivo
              </label>
              {certificateUrl && (
                <span style={{ fontSize: '0.85rem', color: '#00D9FF' }}>
                  {certificateUrl.startsWith('data:application/pdf') ? 'PDF anexado' : 'Imagem anexada'}
                </span>
              )}
              {certificateUrl && (
                <button onClick={() => setCertificateUrl('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Remover
                </button>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
            <button className={styles.btnTertiary} onClick={() => setIsAdding(false)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleSave}>Salvar Curso</button>
          </div>
        </div>
      )}

      {cursos.length === 0 && !isAdding ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} className={styles.emptyStateIcon} />
          <h4 className={styles.emptyStateTitle}>Nenhum curso cadastrado</h4>
          <p className={styles.emptyStateDesc}>Adicione cursos para mostrar que você está sempre se atualizando.</p>
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Adicionar curso
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cursos.map(curso => (
            <div key={curso.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px', height: 'fit-content' }}>
                  <BookOpen size={24} color="#00D9FF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFF' }}>{curso.name}</h3>
                  <p style={{ fontWeight: 600, color: '#00D9FF', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{curso.institution}</p>
                  <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>Carga horária: {curso.workload || 'Não informada'}h</p>
                  <p style={{ color: '#EAF2FF', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                    Concluído em: {curso.end_date ? new Date(curso.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                  {curso.certificate_url && (
                    <a href={curso.certificate_url} download={`certificado-${curso.name.replace(/\s+/g, '-').toLowerCase()}`} style={{ color: '#00D9FF', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}>
                      Baixar Certificado ↓
                    </a>
                  )}
                </div>
              </div>
              <button className={styles.btnTertiary} style={{ height: 'fit-content', color: '#ef4444', padding: '0.5rem' }} onClick={() => handleDelete(curso.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
