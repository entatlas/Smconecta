'use client';

import React, { useState, useEffect } from 'react';
import styles from '../Perfil.module.css';
import { Eye, Globe, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getVisibility, updateVisibility } from '../actions/visibilidade';

const OPTIONS = [
  {
    id: 'PUBLIC',
    title: 'Público',
    description: 'Seu perfil fica visível para todas as empresas da plataforma. Maiores chances de ser encontrado.',
    icon: Globe,
    color: '#00D9FF'
  },
  {
    id: 'UPON_APPLICATION',
    title: 'Apenas para candidaturas',
    description: 'Somente as empresas nas quais você se candidatar poderão ver o seu perfil e seus dados.',
    icon: ShieldCheck,
    color: '#9333ea'
  },
  {
    id: 'PRIVATE',
    title: 'Privado',
    description: 'Seu perfil fica oculto nas buscas. Ideal se você não estiver buscando oportunidades no momento.',
    icon: Lock,
    color: '#64748b'
  }
];

export default function ConfiguracoesTab() {
  const [currentVis, setCurrentVis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const v = await getVisibility();
        setCurrentVis(v);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = async (id: string) => {
    if (id === currentVis) return;
    setSaving(true);
    setCurrentVis(id);
    try {
      await updateVisibility(id);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar visibilidade");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: '#8B9BB4' }}>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px' }}>
          <Eye size={24} color="#00D9FF" />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Visibilidade do Perfil</h2>
          <p className={styles.sectionDesc}>
            Configure quem pode ver o seu currículo e suas informações na plataforma.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {OPTIONS.map(opt => {
          const isSelected = currentVis === opt.id;
          const Icon = opt.icon;
          return (
            <div 
              key={opt.id}
              onClick={() => !saving && handleSelect(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                border: isSelected ? `2px solid ${opt.color}` : '1px solid rgba(255,255,255,0.05)',
                background: isSelected ? `${opt.color}10` : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
                opacity: saving ? 0.7 : 1
              }}
            >
              <div style={{ padding: '0.75rem', borderRadius: '50%', background: isSelected ? opt.color : 'rgba(255,255,255,0.05)' }}>
                <Icon size={24} color={isSelected ? '#fff' : '#8B9BB4'} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: isSelected ? '#fff' : '#EAF2FF', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.25rem' }}>{opt.title}</h4>
                <p style={{ color: '#8B9BB4', fontSize: '0.9rem', lineHeight: '1.4' }}>{opt.description}</p>
              </div>
              <div>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? opt.color : 'transparent'
                }}>
                  {isSelected && <CheckCircle2 size={16} color="#fff" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
