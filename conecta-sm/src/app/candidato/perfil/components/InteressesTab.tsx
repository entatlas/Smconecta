'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfessionalAreas, getCandidateInterests, updateCandidateInterests } from '../actions/interesses';
import { Search, X, CheckCircle2 } from 'lucide-react';
import styles from '../Perfil.module.css';

interface Area {
  id: string;
  name: string;
}

export default function InteressesTab() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [allAreas, userAreas] = await Promise.all([
          getProfessionalAreas(),
          getCandidateInterests()
        ]);
        setAreas(allAreas);
        setSelectedIds(userAreas.map(a => a.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateCandidateInterests(selectedIds);
      setMessage('Interesses atualizados com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: '#8B9BB4' }}>Carregando áreas profissionais...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      <h2 className={styles.sectionTitle}>Áreas Profissionais de Interesse</h2>
      <p className={styles.sectionDesc}>
        Selecione as áreas em que você deseja trabalhar. Isso nos ajudará a recomendar as melhores vagas e cursos para o seu perfil.
      </p>

        {/* Selected Chips */}
        {selectedIds.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Áreas selecionadas ({selectedIds.length}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {selectedIds.map(id => {
                const area = areas.find(a => a.id === id);
                if (!area) return null;
                return (
                  <div key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                    {area.name}
                    <button onClick={() => handleToggle(id)} style={{ background: 'none', border: 'none', color: '#00E5FF', cursor: 'pointer', padding: 0, display: 'flex' }} aria-label="Remover">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="🔍 Buscar áreas (ex: Tecnologia, Administrativo...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {filteredAreas.map(area => {
            const isSelected = selectedIds.includes(area.id);
            return (
              <div 
                key={area.id}
                onClick={() => handleToggle(area.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  border: isSelected ? '1px solid #00E5FF' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                  color: isSelected ? '#fff' : '#cbd5e1'
                }}
              >
                <span>{area.name}</span>
                {isSelected && <CheckCircle2 size={18} color="#00E5FF" />}
              </div>
            );
          })}
          {filteredAreas.length === 0 && (
            <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 0' }}>Nenhuma área encontrada com este nome.</p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: message.includes('Erro') ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>{message}</span>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Interesses'}
          </button>
        </div>
    </div>
  );
}
