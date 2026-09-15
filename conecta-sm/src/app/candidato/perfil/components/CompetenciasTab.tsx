'use client';

import React, { useState, useEffect } from 'react';
import { Star, Search, X, CheckCircle2 } from 'lucide-react';
import styles from '../Perfil.module.css';
import { createClient } from '@/utils/supabase/client';

const COMMON_SKILLS = [
  "Comunicação", "Liderança", "Trabalho em Equipe", "Resolução de Problemas",
  "Gestão de Tempo", "Pacote Office", "Atendimento ao Cliente", "Vendas",
  "Marketing Digital", "Gestão de Projetos", "Análise de Dados", "Programação",
  "Design Gráfico", "Recursos Humanos", "Finanças", "Python", "JavaScript",
  "React", "Node.js", "SQL", "Excel Avançado", "Negociação", "Figma"
].sort();

export default function CompetenciasTab() {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<{id: string, name: string, level: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
    if (!profile) return setLoading(false);

    const { data: candidate } = await supabase.from('candidates').select('id').eq('profile_id', profile.id).single();
    if (!candidate) return setLoading(false);

    setCandidateId(candidate.id);

    const { data: skills } = await supabase.from('candidate_skills').select('id, name, level').eq('candidate_id', candidate.id);
    if (skills) setSelectedSkills(skills);
    
    setLoading(false);
  }

  const handleToggle = async (skillName: string) => {
    let currentCandidateId = candidateId;
    
    // Se não tiver candidateId, tenta criar
    if (!currentCandidateId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
        if (profile) {
          const { data: newCandidate, error: candError } = await supabase.from('candidates').insert({ 
            id: crypto.randomUUID(),
            profile_id: profile.id 
          }).select('id').single();
          if (candError) {
            alert("Erro ao criar perfil de candidato: " + candError.message);
          }
          if (newCandidate) {
            setCandidateId(newCandidate.id);
            currentCandidateId = newCandidate.id;
          }
        }
      }
    }

    if (!currentCandidateId) {
      alert("Por favor, preencha e salve seus 'Dados Pessoais' primeiro para criar seu perfil de candidato.");
      return;
    }
    
    const existing = selectedSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    
    if (existing) {
      // Remove
      setSaving(true);
      await supabase.from('candidate_skills').delete().eq('id', existing.id);
      setSelectedSkills(prev => prev.filter(s => s.id !== existing.id));
      window.dispatchEvent(new Event('profile-updated'));
      setSaving(false);
    } else {
      // Add
      setSaving(true);
      const { data, error } = await supabase.from('candidate_skills').insert({
        id: crypto.randomUUID(),
        candidate_id: currentCandidateId,
        name: skillName,
        level: 'Básico'
      }).select('id, name, level').single();
      
      if (error) {
        alert("Erro ao adicionar competência: " + error.message);
        console.error(error);
      }
      
      if (data) {
        setSelectedSkills(prev => [...prev, data]);
        setSearchTerm('');
        window.dispatchEvent(new Event('profile-updated'));
      }
      setSaving(false);
    }
  };

  const handleLevelChange = async (id: string, newLevel: string) => {
    setSaving(true);
    const { error } = await supabase.from('candidate_skills').update({ level: newLevel }).eq('id', id);
    if (!error) {
      setSelectedSkills(prev => prev.map(s => s.id === id ? { ...s, level: newLevel } : s));
    }
    setSaving(false);
  };

  const filteredSkills = COMMON_SKILLS.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'Especialista':
        return { bg: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)', text: '#FFF', border: '1px solid #26D0CE', icon: '💎' };
      case 'Avançado':
        return { bg: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', text: '#FFF', border: '1px solid #ED8F03', icon: '🥇' };
      case 'Intermediário':
        return { bg: 'linear-gradient(135deg, #E2E2E2 0%, #999999 100%)', text: '#333', border: '1px solid #999999', icon: '🥈' };
      case 'Básico':
      default:
        return { bg: 'linear-gradient(135deg, #e55d87 0%, #5fc3e4 100%)', text: '#FFF', border: '1px solid #e55d87', icon: '🥉' };
    }
  };

  if (loading) {
    return (
      <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: '#8B9BB4' }}>Carregando competências...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      <h2 className={styles.sectionTitle}>Competências</h2>
      <p className={styles.sectionDesc}>
        Adicione suas habilidades técnicas e comportamentais (soft e hard skills).
      </p>

      {/* Selected Chips */}
      {selectedSkills.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#EAF2FF', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Selecionadas ({selectedSkills.length}):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedSkills.map(skill => {
              const style = getBadgeStyle(skill.level || 'Básico');
              return (
                <div key={skill.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: style.bg, color: style.text, border: style.border, padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '1rem' }}>{style.icon}</span>
                  <span style={{ fontWeight: 600 }}>{skill.name}</span>
                  
                  <select 
                    value={skill.level || 'Básico'} 
                    onChange={(e) => handleLevelChange(skill.id, e.target.value)}
                    disabled={saving}
                    style={{ background: 'transparent', color: style.text, border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.9, marginLeft: '0.5rem', fontWeight: 600 }}
                  >
                    <option style={{ color: '#000' }} value="Básico">Básico</option>
                    <option style={{ color: '#000' }} value="Intermediário">Intermediário</option>
                    <option style={{ color: '#000' }} value="Avançado">Avançado</option>
                    <option style={{ color: '#000' }} value="Especialista">Especialista</option>
                  </select>

                  <button onClick={() => handleToggle(skill.name)} disabled={saving} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '20px', height: '20px', border: 'none', color: style.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.5 : 1 }}>
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B9BB4' }} />
        <input 
          type="text" 
          placeholder="Buscar competências (ex: Comunicação, Python...)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(3, 18, 37, 0.5)', color: '#FFF', fontSize: '0.95rem' }}
        />
      </div>

      {/* Selectable List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {filteredSkills.map(skill => {
          const isSelected = selectedSkills.some(s => s.name === skill);
          return (
            <div 
              key={skill}
              onClick={() => !saving && handleToggle(skill)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                border: isSelected ? '1px solid #00D9FF' : '1px solid rgba(255,255,255,0.05)',
                background: isSelected ? 'rgba(0, 217, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
                color: isSelected ? '#FFF' : '#8B9BB4',
                opacity: saving ? 0.7 : 1
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{skill}</span>
              {isSelected && <CheckCircle2 size={18} color="#00D9FF" />}
            </div>
          );
        })}
        {filteredSkills.length === 0 && (
          <p style={{ color: '#8B9BB4', gridColumn: '1 / -1', textAlign: 'center', padding: '1rem 0 0 0' }}>Nenhuma competência padrão encontrada com este nome.</p>
        )}
        
        {searchTerm.trim().length > 0 && !selectedSkills.some(s => s.name.toLowerCase() === searchTerm.trim().toLowerCase()) && (
          <div 
            onClick={() => !saving && handleToggle(searchTerm.trim())}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.75rem 1rem', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
              border: '1px dashed #0878FF',
              background: 'rgba(8, 120, 255, 0.05)',
              color: '#0878FF',
              gridColumn: '1 / -1',
              marginTop: '0.5rem',
              fontWeight: 500,
              opacity: saving ? 0.7 : 1
            }}
          >
            + Adicionar "{searchTerm.trim()}" como competência
          </div>
        )}
      </div>
    </div>
  );
}
