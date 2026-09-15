'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '../Perfil.module.css';

export default function ExperienciaTab() {
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [hiringType, setHiringType] = useState('CLT');
  const [isCurrent, setIsCurrent] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState('');

  useEffect(() => {
    loadExperiencias();
  }, [supabase]);

  async function loadExperiencias() {
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

    const { data } = await supabase.from('candidate_experiences').select('*').eq('candidate_id', candidate.id).order('start_date', { ascending: false });
    if (data) setExperiencias(data);
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

    const { error } = await supabase.from('candidate_experiences').insert({
      id: crypto.randomUUID(),
      candidate_id: candidate.id,
      company,
      role,
      hiring_type: hiringType,
      is_current: isCurrent,
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: (!isCurrent && endDate) ? new Date(endDate).toISOString() : null,
      activities
    });

    if (error) {
      alert("Erro ao salvar experiência: " + error.message);
      console.error(error);
      return;
    }
    
    setIsAdding(false);
    setCompany('');
    setRole('');
    setActivities('');
    setIsCurrent(false);
    setStartDate('');
    setEndDate('');
    loadExperiencias();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('candidate_experiences').delete().eq('id', id);
    loadExperiencias();
  };

  if (loading) return (
    <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: '#8B9BB4' }}>Carregando experiências...</p>
    </div>
  );

  return (
    <div className={styles.mainCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className={styles.sectionTitle}>Experiência Profissional</h2>
          <p className={styles.sectionDesc} style={{ marginBottom: 0 }}>
            Liste suas experiências mais relevantes e resultados obtidos.
          </p>
        </div>
        {!isAdding && (
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Adicionar Experiência
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '2.5rem' }}>
          <h3 className={styles.formGroupTitle} style={{ borderBottom: 'none', marginBottom: '1.5rem', fontSize: '1.1rem', color: '#FFF' }}>Nova Experiência</h3>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <Input label="Empresa" value={company} onChange={e => setCompany(e.target.value)} />
            <Input label="Cargo" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          
          <div className={styles.grid3} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Regime de Contratação</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={hiringType} onChange={e => setHiringType(e.target.value)}>
                <option>CLT</option>
                <option>PJ</option>
                <option>Estágio</option>
                <option>Freelancer</option>
              </select>
            </div>
            <Input label="Data de Início" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <div>
              <Input label="Data de Saída" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isCurrent} />
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#EAF2FF', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)} style={{ accentColor: '#00D9FF' }} /> Trabalho atualmente aqui
                </label>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '0.25rem' }}>Atividades e Responsabilidades</label>
            <textarea 
              style={{ width: '100%', minHeight: '120px', padding: '1rem', background: '#031225', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#EAF2FF', outline: 'none', resize: 'vertical' }}
              placeholder="Descreva o que você fazia, suas principais entregas e resultados..."
              value={activities}
              onChange={e => setActivities(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
            <button className={styles.btnTertiary} onClick={() => setIsAdding(false)}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleSave}>Salvar Experiência</button>
          </div>
        </div>
      )}

      {experiencias.length === 0 && !isAdding ? (
        <div className={styles.emptyState}>
          <Briefcase size={48} className={styles.emptyStateIcon} />
          <h4 className={styles.emptyStateTitle}>Ainda não há experiências cadastradas</h4>
          <p className={styles.emptyStateDesc}>Adicione suas experiências profissionais para ajudar recrutadores a conhecerem sua trajetória e entregas.</p>
          <button className={styles.btnSecondary} onClick={() => setIsAdding(true)} style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Adicionar experiência
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {experiencias.map(exp => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px', height: 'fit-content' }}>
                  <Briefcase size={24} color="#00D9FF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFF' }}>{exp.role}</h3>
                  <p style={{ fontWeight: 600, color: '#00D9FF', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{exp.company} <span style={{ color: '#8B9BB4', fontWeight: 400 }}>• {exp.hiring_type}</span></p>
                  <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                    {exp.start_date ? new Date(exp.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''} 
                    {' - '} 
                    {exp.is_current ? 'Atualmente' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
                  </p>
                  <p style={{ color: '#EAF2FF', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {exp.activities}
                  </p>
                </div>
              </div>
              <button className={styles.btnTertiary} style={{ height: 'fit-content', color: '#ef4444', padding: '0.5rem' }} onClick={() => handleDelete(exp.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
