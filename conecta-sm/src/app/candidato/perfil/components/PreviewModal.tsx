'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import styles from '../Perfil.module.css';

interface PreviewModalProps {
  onClose: () => void;
}

export default function PreviewModal({ onClose }: PreviewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    loadProfileData();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  async function loadProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, nome, email, telefone, avatar_url')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile) return;

    const { data: candidate } = await supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', profile.id)
      .single();

    if (!candidate) return;

    const [edu, exp, skills, langs] = await Promise.all([
      supabase.from('candidate_education').select('*').eq('candidate_id', candidate.id),
      supabase.from('candidate_experiences').select('*').eq('candidate_id', candidate.id).order('start_date', { ascending: false }),
      supabase.from('candidate_skills').select('*').eq('candidate_id', candidate.id),
      supabase.from('candidate_languages').select('*').eq('candidate_id', candidate.id),
    ]);

    setData({
      profile,
      candidate,
      education: edu.data || [],
      experiences: exp.data || [],
      skills: skills.data || [],
      languages: langs.data || []
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(3, 18, 37, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#00D9FF', fontSize: '1.25rem', fontWeight: 600 }}>Preparando prévia do perfil...</p>
      </div>
    );
  }

  const { profile, candidate, experiences, education, skills, languages } = data;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(3, 18, 37, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', background: '#031225', borderRadius: '16px', border: '1px solid rgba(0, 217, 255, 0.2)', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Sticky Header with Close Button */}
        <div style={{ position: 'sticky', top: 0, background: 'rgba(3, 18, 37, 0.95)', backdropFilter: 'blur(10px)', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h2 style={{ fontSize: '1.1rem', color: '#EAF2FF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ExternalLink size={18} color="#00D9FF" /> Prévia do Dossiê Profissional
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B9BB4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '3rem 2rem' }}>
          
          {/* Header Profile */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#061A32', overflow: 'hidden', border: '3px solid rgba(0, 217, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill style={{ objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem', color: '#00D9FF', fontWeight: 700 }}>{profile.nome.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFF', margin: '0 0 0.25rem 0' }}>{profile.nome}</h1>
              <p style={{ fontSize: '1.25rem', color: '#00D9FF', fontWeight: 500, margin: '0 0 1rem 0' }}>{candidate.desired_role || 'Profissional'}</p>
              
              <div style={{ display: 'flex', gap: '1.5rem', color: '#8B9BB4', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {[candidate.city, candidate.state].filter(Boolean).join(', ') || 'Localização não informada'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {profile.email}</span>
                {profile.telefone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> {profile.telefone}</span>}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '2rem 0' }} />

          {/* About */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#FFF', fontWeight: 700, marginBottom: '1rem' }}>Sobre mim</h3>
            <p style={{ color: '#EAF2FF', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {candidate.about || 'Nenhum resumo profissional adicionado ainda.'}
            </p>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#FFF', fontWeight: 700, marginBottom: '1.5rem' }}>Experiência Profissional</h3>
            {experiences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {experiences.map((exp: any, i: number) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(0, 217, 255, 0.3)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#EAF2FF', fontSize: '1.1rem' }}>{exp.role}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#00D9FF', fontWeight: 500 }}>{exp.company} <span style={{ color: '#8B9BB4', fontWeight: 400 }}>• {exp.hiring_type}</span></p>
                    <p style={{ margin: '0 0 1rem 0', color: '#8B9BB4', fontSize: '0.9rem' }}>
                      {exp.start_date ? new Date(exp.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''} - {exp.is_current ? 'Atualmente' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
                    </p>
                    <p style={{ margin: 0, color: '#EAF2FF', lineHeight: 1.6 }}>{exp.activities}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8B9BB4' }}>Nenhuma experiência cadastrada.</p>
            )}
          </div>

          {/* Education */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#FFF', fontWeight: 700, marginBottom: '1.5rem' }}>Formação Acadêmica</h3>
            {education.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {education.map((edu: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#EAF2FF', fontSize: '1.1rem' }}>{edu.course}</h4>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#00D9FF' }}>{edu.institution}</p>
                    <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.9rem' }}>{edu.level} • {edu.start_date ? new Date(edu.start_date).getFullYear() : ''} - {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Atualmente'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8B9BB4' }}>Nenhuma formação acadêmica cadastrada.</p>
            )}
          </div>

          {/* Skills & Languages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#FFF', fontWeight: 700, marginBottom: '1.5rem' }}>Competências</h3>
              {skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skills.map((s: any, i: number) => (
                    <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', borderRadius: '999px', fontSize: '0.9rem', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8B9BB4' }}>Nenhuma competência adicionada.</p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#FFF', fontWeight: 700, marginBottom: '1.5rem' }}>Idiomas</h3>
              {languages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {languages.map((l: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: '#EAF2FF' }}>{l.language}</span>
                      <span style={{ color: '#8B9BB4' }}>{l.understanding}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8B9BB4' }}>Nenhum idioma adicionado.</p>
              )}
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div style={{ padding: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(3, 18, 37, 0.5)', display: 'flex', justifyContent: 'center' }}>
          <button className={styles.btnSecondary} onClick={onClose} style={{ padding: '0.75rem 3rem' }}>
            Voltar para edição
          </button>
        </div>

      </div>
    </div>
  );
}
