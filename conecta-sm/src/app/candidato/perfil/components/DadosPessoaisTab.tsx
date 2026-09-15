'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { COMMON_ROLES } from '@/lib/constants/cargos';
import { Input } from '@/components/ui/Input/Input';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { createClient } from '@/utils/supabase/client';
import styles from '../Perfil.module.css';
import { Camera, FileText, Upload, Download } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { SectionLoader } from '@/components/ui/Loading/SectionLoader';
import { PhoneInput, CEPInput, DateInput, CurrencyInput } from '@/components/ui/Input/MaskedInputs';
import Image from 'next/image';

export default function DadosPessoaisTab() {
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const supabase = createClient();

  // Profile data
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Candidate data
  const [birthDate, setBirthDate] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  const [professionalArea, setProfessionalArea] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [modality, setModality] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          nome, email, telefone, avatar_url, cover_url,
          candidates (
            birth_date, zip_code, address, neighborhood, city, state, desired_role, professional_area, salary_expectation, resume_url, hiring_types, availability, about
          )
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (profile) {
        setNome(profile.nome || '');
        setEmail(profile.email || '');
        setTelefone(profile.telefone || '');
        setAvatarUrl(profile.avatar_url || '');
        setCoverUrl(profile.cover_url || '');
        
        const candidateData = Array.isArray(profile.candidates) ? profile.candidates[0] : profile.candidates;
        
        if (candidateData) {
          let loadedBirthDate = '';
          if (candidateData.birth_date) {
            const isoDate = candidateData.birth_date.split('T')[0];
            if (isoDate && isoDate.includes('-')) {
              const parts = isoDate.split('-');
              if (parts.length === 3) {
                loadedBirthDate = `${parts[2]}${parts[1]}${parts[0]}`;
              }
            }
          }
          setBirthDate(loadedBirthDate);
          setZipCode(candidateData.zip_code || '');
          setAddress(candidateData.address || '');
          setNeighborhood(candidateData.neighborhood || '');
          setCity(candidateData.city || '');
          setState(candidateData.state || '');
          setDesiredRole(candidateData.desired_role || '');
          setProfessionalArea(candidateData.professional_area || '');
          setSalaryExpectation(candidateData.salary_expectation || '');
          setEmploymentType(candidateData.hiring_types || '');
          setModality(candidateData.availability || '');
          setResumeUrl(candidateData.resume_url || '');
          setAbout(candidateData.about || '');
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const { execute: handleSave, isLoading: saving } = useAsyncAction(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Update Profile
      const { error: profileError } = await supabase.from('profiles').update({
        nome,
        telefone,
        avatar_url: avatarUrl,
        cover_url: coverUrl
      }).eq('auth_user_id', user.id);

      if (profileError) throw new Error(profileError.message);

      // Update Candidate
      const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (profile) {
        const { data: existingCandidate } = await supabase.from('candidates').select('id').eq('profile_id', profile.id).maybeSingle();
        
        let formattedDate = null;
        if (birthDate) {
          if (birthDate.includes('-')) {
            formattedDate = birthDate;
          } else if (birthDate.length === 8) {
            formattedDate = `${birthDate.substring(4,8)}-${birthDate.substring(2,4)}-${birthDate.substring(0,2)}`;
          }
        }

        const payload = {
          birth_date: formattedDate,
          zip_code: zipCode,
          address,
          neighborhood,
          city,
          state,
          desired_role: desiredRole,
          professional_area: professionalArea,
          salary_expectation: salaryExpectation || null,
          hiring_types: employmentType,
          availability: modality,
          resume_url: resumeUrl || null,
          about: about
        };

        if (existingCandidate) {
          const { error: candidateError } = await supabase.from('candidates').update(payload).eq('id', existingCandidate.id);
          if (candidateError) throw new Error(candidateError.message);
        } else {
          const { error: candidateError } = await supabase.from('candidates').insert({
            id: crypto.randomUUID(),
            profile_id: profile.id,
            ...payload
          });
          if (candidateError) throw new Error(candidateError.message);
        }
      }
    },
    {
      onSuccess: () => {
        setSuccessMsg('Dados atualizados com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      onError: (err) => {
        alert('Erro ao salvar: ' + err.message);
      }
    }
  );

  if (loading) return (
    <div className={styles.mainCard} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <SectionLoader message="Carregando dados pessoais..." />
    </div>
  );

  return (
    <div className={styles.mainCard}>
      <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
      <p className={styles.sectionDesc}>
        Configure suas informações básicas, localização e preferências de carreira.
      </p>

      {/* Cover Section */}
      <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#EAF2FF' }}>Foto de Capa</span>
          <label htmlFor="cover-upload" className={styles.btnSecondary} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            <Camera size={16} /> Alterar Capa
          </label>
        </div>
        
        <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: 'linear-gradient(90deg, #11284A 0%, #061A32 100%)', position: 'relative' }}>
          {coverUrl && (
            <Image src={coverUrl} alt="Cover" fill style={{ objectFit: 'cover' }} />
          )}
        </div>
        <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              setCoverUrl(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }} />
        <span className={styles.avatarHint} style={{ display: 'block', marginTop: '12px' }}>Uma boa foto de capa destaca seu perfil. JPG ou PNG.</span>
      </div>

      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarCircle}>
          {avatarUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image src={avatarUrl} alt="Avatar" fill style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <span className={styles.avatarFallback}>{nome.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className={styles.avatarActions}>
          <label htmlFor="avatar-upload" className={styles.btnSecondary} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
            <Camera size={16} /> Alterar foto
          </label>
          <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new window.Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 250;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                setAvatarUrl(canvas.toDataURL('image/jpeg', 0.8));
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          }} />
          <span className={styles.avatarHint}>Use uma foto profissional. JPG ou PNG até 5MB.</span>
        </div>
      </div>

      {/* Info Pessoais */}
      <div className={styles.formGroup}>
        <h3 className={styles.formGroupTitle}>Informações Pessoais</h3>
        <div className={styles.grid2}>
          <Input label="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input label="E-mail" type="email" value={email} disabled />
          <PhoneInput label="Telefone / WhatsApp" value={telefone} onValueChange={(unmasked) => setTelefone(unmasked)} />
          <DateInput label="Data de Nascimento" value={birthDate} onValueChange={(unmasked) => setBirthDate(unmasked)} />
        </div>
      </div>

      {/* Localização */}
      <div className={styles.formGroup}>
        <h3 className={styles.formGroupTitle}>Localização</h3>
        <div className={styles.grid2} style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '1.25rem' }}>
          <CEPInput 
            label="CEP" 
            value={zipCode} 
            onValueChange={(unmasked) => setZipCode(unmasked)} 
            onAddressFetch={(data) => {
              if (data.logradouro) setAddress(data.logradouro);
              if (data.bairro) setNeighborhood(data.bairro);
              if (data.localidade) setCity(data.localidade);
              if (data.uf) setState(data.uf);
            }} 
          />
          <Input label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className={styles.grid3}>
          <Input label="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Estado" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
      </div>

      {/* Objetivo */}
      <div className={styles.formGroup}>
        <h3 className={styles.formGroupTitle}>Objetivo Profissional</h3>
        <div className={styles.grid2}>
          <div>
            <AutocompleteInput 
              label="Cargo Desejado" 
              value={desiredRole} 
              onChange={setDesiredRole} 
              options={COMMON_ROLES}
              placeholder="Ex: Desenvolvedor Front-end"
            />
          </div>
          <div>
            <AutocompleteInput 
              label="Área de Interesse" 
              value={professionalArea} 
              onChange={setProfessionalArea} 
              placeholder="Ex: Tecnologia, Vendas..." 
              options={[
                "Tecnologia da Informação",
                "Vendas e Comercial",
                "Administração",
                "Atendimento ao Cliente",
                "Marketing",
                "Recursos Humanos",
                "Financeiro",
                "Operações / Logística",
                "Saúde",
                "Educação",
                "Engenharia",
                "Design e Criatividade"
              ]}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Nível Profissional</label>
            <select style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }}>
              <option value="">Selecione...</option>
              <option value="JUNIOR">Júnior</option>
              <option value="PLENO">Pleno</option>
              <option value="SENIOR">Sênior</option>
              <option value="SPECIALIST">Especialista</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Sobre Você</label>
          <textarea 
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Conte um pouco sobre sua trajetória, conquistas e objetivos..."
            style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none', minHeight: '120px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Preferências */}
      <div className={styles.formGroup}>
        <h3 className={styles.formGroupTitle}>Preferências Profissionais</h3>
        <div className={styles.grid3}>
          <CurrencyInput label="Pretensão Salarial" value={salaryExpectation} onValueChange={(unmasked) => setSalaryExpectation(unmasked)} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Modalidade</label>
            <select value={modality} onChange={e => setModality(e.target.value)} style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }}>
              <option value="">Indiferente</option>
              <option value="REMOTE">Remoto</option>
              <option value="HYBRID">Híbrido</option>
              <option value="ONSITE">Presencial</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#8B9BB4' }}>Tipo de Contratação</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} style={{ padding: '0.75rem', background: '#031225', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#EAF2FF', outline: 'none' }}>
              <option value="">Qualquer</option>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="FREELANCE">Freelancer</option>
              <option value="INTERNSHIP">Estágio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Currículo Anexo */}
      <div className={styles.formGroup}>
        <h3 className={styles.formGroupTitle}>Currículo em Anexo (PDF/Word)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#031225', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px', color: '#00D9FF' }}>
            <FileText size={24} />
          </div>
          <div style={{ flex: 1 }}>
            {resumeUrl ? (
              <div>
                <p style={{ color: '#EAF2FF', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Currículo Carregado</p>
                <a href={resumeUrl} download="Meu_Curriculo" style={{ color: '#00D9FF', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Download size={14} /> Baixar para conferir
                </a>
              </div>
            ) : (
              <div>
                <p style={{ color: '#EAF2FF', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Nenhum currículo anexado</p>
                <p style={{ color: '#8B9BB4', fontSize: '0.85rem', margin: 0 }}>Faça upload para que as empresas possam baixar seu currículo original.</p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="resume-upload" className={styles.btnSecondary} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Upload size={16} /> {resumeUrl ? 'Substituir' : 'Enviar Arquivo'}
            </label>
            <input 
              id="resume-upload" 
              type="file" 
              accept=".pdf,.doc,.docx" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Limit size to ~5MB
                if (file.size > 5 * 1024 * 1024) {
                  alert("O arquivo é muito grande. O limite é 5MB.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                  setResumeUrl(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }} 
            />
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {successMsg && <span style={{ color: '#10b981', fontWeight: 500, fontSize: '0.9rem' }}>{successMsg}</span>}
        <button className={styles.btnSecondary}>Cancelar</button>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
