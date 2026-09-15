'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle2, Award, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import styles from '../Perfil.module.css';
import { createClient } from '@/utils/supabase/client';

const COMMON_LANGUAGES = [
  "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Mandarim", 
  "Japonês", "Português", "Russo", "Árabe", "Coreano", "Libras"
].sort();

interface CandidateLanguage {
  id: string;
  language: string;
  understanding: string;
  speaking: string;
  reading: string;
  writing: string;
  certificate_url?: string | null;
  certificate_name?: string | null;
}

export default function IdiomasTab() {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [selectedLangs, setSelectedLangs] = useState<CandidateLanguage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [activeFormLang, setActiveFormLang] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [understanding, setUnderstanding] = useState('Intermediário');
  const [speaking, setSpeaking] = useState('Intermediário');
  const [reading, setReading] = useState('Intermediário');
  const [writing, setWriting] = useState('Intermediário');
  const [certificateName, setCertificateName] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadLangs();
  }, []);

  async function loadLangs() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
    if (!profile) return setLoading(false);

    const { data: candidate } = await supabase.from('candidates').select('id').eq('profile_id', profile.id).single();
    if (!candidate) return setLoading(false);

    setCandidateId(candidate.id);

    const { data: langs } = await supabase.from('candidate_languages').select('*').eq('candidate_id', candidate.id);
    if (langs) setSelectedLangs(langs);
    
    setLoading(false);
  }

  const openForm = (langName: string, existing?: CandidateLanguage) => {
    setActiveFormLang(langName);
    if (existing) {
      setEditingId(existing.id);
      setUnderstanding(existing.understanding || 'Intermediário');
      setSpeaking(existing.speaking || 'Intermediário');
      setReading(existing.reading || 'Intermediário');
      setWriting(existing.writing || 'Intermediário');
      setCertificateName(existing.certificate_name || '');
      setCertificateUrl(existing.certificate_url || '');
    } else {
      setEditingId(null);
      setUnderstanding('Intermediário');
      setSpeaking('Intermediário');
      setReading('Intermediário');
      setWriting('Intermediário');
      setCertificateName('');
      setCertificateUrl('');
    }
  };

  const closeForm = () => {
    setActiveFormLang(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!candidateId || !activeFormLang) {
      alert("Por favor, preencha e salve seus 'Dados Pessoais' primeiro para criar seu perfil.");
      return;
    }
    
    setSaving(true);
    
    const payload = {
      candidate_id: candidateId,
      language: activeFormLang,
      understanding,
      speaking,
      reading,
      writing,
      certificate_name: certificateName || null,
      certificate_url: certificateUrl || null
    };

    if (editingId) {
      const { error } = await supabase.from('candidate_languages').update(payload).eq('id', editingId);
      if (error) {
        alert("Erro ao atualizar idioma: " + error.message);
        console.error(error);
      }
    } else {
      const { error } = await supabase.from('candidate_languages').insert({
        id: crypto.randomUUID(),
        ...payload
      });
      if (error) {
        alert("Erro ao adicionar idioma: " + error.message);
        console.error(error);
      }
    }

    await loadLangs();
    closeForm();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    await supabase.from('candidate_languages').delete().eq('id', id);
    setSelectedLangs(prev => prev.filter(s => s.id !== id));
    if (editingId === id) closeForm();
    setSaving(false);
  };

  const filteredLangs = COMMON_LANGUAGES.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: '#8B9BB4' }}>Carregando idiomas...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      <h2 className={styles.sectionTitle}>Idiomas</h2>
      <p className={styles.sectionDesc}>
        Quais idiomas você domina? Adicione o idioma e anexe seus certificados (opcional).
      </p>

      {/* Lista de Idiomas Adicionados */}
      {selectedLangs.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ color: '#EAF2FF', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Idiomas Cadastrados:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedLangs.map(lang => (
              <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px', height: 'fit-content' }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🌍</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {lang.language}
                      {lang.certificate_url && <Award size={16} color="#00D9FF" />}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: 0 }}>Compreensão: <span style={{ color: '#EAF2FF' }}>{lang.understanding}</span></p>
                      <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: 0 }}>Conversação: <span style={{ color: '#EAF2FF' }}>{lang.speaking}</span></p>
                      <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: 0 }}>Leitura: <span style={{ color: '#EAF2FF' }}>{lang.reading}</span></p>
                      <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: 0 }}>Escrita: <span style={{ color: '#EAF2FF' }}>{lang.writing}</span></p>
                    </div>

                    {lang.certificate_name && (
                      <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Certificado: {lang.certificate_name}</p>
                    )}
                    {lang.certificate_url && (
                      <a href={lang.certificate_url} download={`certificado-${lang.language.toLowerCase()}`} style={{ color: '#00D9FF', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Baixar Certificado ↓
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className={styles.btnSecondary} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => openForm(lang.language, lang)}>Editar</button>
                  <button className={styles.btnTertiary} style={{ color: '#ef4444', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleDelete(lang.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Adição/Edição */}
      {activeFormLang && (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(0, 217, 255, 0.3)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className={styles.formGroupTitle} style={{ borderBottom: 'none', margin: 0, fontSize: '1.1rem', color: '#FFF' }}>
              {editingId ? 'Editar Idioma: ' : 'Adicionar Idioma: '} <span style={{ color: '#00D9FF' }}>{activeFormLang}</span>
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: '#8B9BB4', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível de Compreensão</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={understanding} onChange={e => setUnderstanding(e.target.value)}>
                <option>Básico</option>
                <option>Intermediário</option>
                <option>Avançado</option>
                <option>Fluente/Nativo</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível de Conversação</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={speaking} onChange={e => setSpeaking(e.target.value)}>
                <option>Básico</option>
                <option>Intermediário</option>
                <option>Avançado</option>
                <option>Fluente/Nativo</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível de Leitura</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={reading} onChange={e => setReading(e.target.value)}>
                <option>Básico</option>
                <option>Intermediário</option>
                <option>Avançado</option>
                <option>Fluente/Nativo</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível de Escrita</label>
              <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }} value={writing} onChange={e => setWriting(e.target.value)}>
                <option>Básico</option>
                <option>Intermediário</option>
                <option>Avançado</option>
                <option>Fluente/Nativo</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <h4 style={{ color: '#EAF2FF', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={16} /> Certificado (Opcional)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Input label="Nome da Certificação (Ex: TOEFL, IELTS)" value={certificateName} onChange={e => setCertificateName(e.target.value)} />
              
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '0.5rem' }}>Arquivo do Certificado</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="file" 
                    id="idioma-cert-upload" 
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
                  <label htmlFor="idioma-cert-upload" className={styles.btnSecondary} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
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
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className={styles.btnTertiary} onClick={closeForm}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>Salvar Idioma</button>
          </div>
        </div>
      )}

      {/* Selectable List */}
      {!activeFormLang && (
        <>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B9BB4' }} />
            <input 
              type="text" 
              placeholder="Buscar ou adicionar novo idioma..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(3, 18, 37, 0.5)', color: '#FFF', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {searchTerm && !COMMON_LANGUAGES.some(l => l.toLowerCase() === searchTerm.toLowerCase()) && !selectedLangs.some(s => s.language.toLowerCase() === searchTerm.toLowerCase()) && (
              <div 
                onClick={() => openForm(searchTerm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  border: '1px dashed #00D9FF', background: 'rgba(0, 217, 255, 0.05)', color: '#00D9FF', transition: 'all 0.2s'
                }}
              >
                <Plus size={16} /> Adicionar "{searchTerm}"
              </div>
            )}

            {filteredLangs.map(lang => {
              const existing = selectedLangs.find(s => s.language === lang);
              const isSelected = !!existing;
              
              if (isSelected) return null; // Don't show already selected ones in the suggestions

              return (
                <div 
                  key={lang}
                  onClick={() => openForm(lang)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                    color: '#8B9BB4'
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{lang}</span>
                  <Plus size={16} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
