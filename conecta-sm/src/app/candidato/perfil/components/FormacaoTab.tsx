'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '../Perfil.module.css';

export default function FormacaoTab() {
  const [formacoes, setFormacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  // Form states
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('Graduação');
  const [status, setStatus] = useState('Concluído');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadFormacoes();
  }, [supabase]);

  async function loadFormacoes() {
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

    const { data } = await supabase.from('candidate_education').select('*').eq('candidate_id', candidate.id).order('start_date', { ascending: false });
    if (data) setFormacoes(data);
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

    const { error } = await supabase.from('candidate_education').insert({
      id: crypto.randomUUID(),
      candidate_id: candidate.id,
      institution,
      course,
      level,
      status,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null
    });

    if (error) {
      alert("Erro ao salvar formação: " + error.message);
      console.error(error);
      return;
    }
    
    setIsAdding(false);
    setInstitution('');
    setCourse('');
    setStartDate('');
    setEndDate('');
    loadFormacoes();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('candidate_education').delete().eq('id', id);
    loadFormacoes();
  };

  if (loading) return (
    <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: '#8B9BB4' }}>Carregando formações...</p>
    </div>
  );

  return (
    <div className={styles.mainCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className={styles.sectionTitle}>Formação Acadêmica</h2>
          <p className={styles.sectionDesc} style={{ marginBottom: 0 }}>
            Adicione suas graduações, pós-graduações e ensino técnico.
          </p>
        </div>
        {!isAdding && (
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Adicionar Formação
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '2.5rem' }}>
          <h3 className={styles.formGroupTitle} style={{ borderBottom: 'none', marginBottom: '1.5rem', fontSize: '1.1rem', color: '#FFF' }}>Nova Formação</h3>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <Input label="Instituição" value={institution} onChange={e => setInstitution(e.target.value)} />
            <Input label="Curso" value={course} onChange={e => setCourse(e.target.value)} />
          </div>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={level} onChange={e => setLevel(e.target.value)}>
                <option>Ensino Médio</option>
                <option>Técnico</option>
                <option>Graduação</option>
                <option>Pós-graduação / Especialização</option>
                <option>Mestrado</option>
                <option>Doutorado</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Status</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={status} onChange={e => setStatus(e.target.value)}>
                <option>Concluído</option>
                <option>Em andamento</option>
                <option>Trancado</option>
              </select>
            </div>
          </div>
          
          <div className={styles.grid2} style={{ marginBottom: '2rem' }}>
            <Input label="Data de Início" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="Data de Conclusão (ou previsão)" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
            <button className={styles.btnTertiary} onClick={() => setIsAdding(false)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleSave}>Salvar Formação</button>
          </div>
        </div>
      )}

      {formacoes.length === 0 && !isAdding ? (
        <div className={styles.emptyState}>
          <GraduationCap size={48} className={styles.emptyStateIcon} />
          <h4 className={styles.emptyStateTitle}>Ainda não há formações cadastradas</h4>
          <p className={styles.emptyStateDesc}>Adicione sua base acadêmica para ajudar recrutadores a conhecerem sua trajetória escolar.</p>
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Adicionar formação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formacoes.map(formacao => (
            <div key={formacao.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px', height: 'fit-content' }}>
                  <GraduationCap size={24} color="#00D9FF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFF' }}>{formacao.course}</h3>
                  <p style={{ fontWeight: 600, color: '#00D9FF', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{formacao.institution}</p>
                  <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>{formacao.level} • {formacao.status}</p>
                  <p style={{ color: '#EAF2FF', fontSize: '0.85rem', margin: 0 }}>
                    {formacao.start_date ? new Date(formacao.start_date).getFullYear() : 'N/A'} - {formacao.end_date ? new Date(formacao.end_date).getFullYear() : 'Atualmente'}
                  </p>
                </div>
              </div>
              <button className={styles.btnTertiary} style={{ height: 'fit-content', color: '#ef4444', padding: '0.5rem' }} onClick={() => handleDelete(formacao.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
