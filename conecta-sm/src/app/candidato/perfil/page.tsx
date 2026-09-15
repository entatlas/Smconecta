'use client';

import React, { useState, useEffect } from 'react';
import styles from './Perfil.module.css';
import { User, Briefcase, GraduationCap, Star, Languages, Award, FileText, Settings, Eye, CheckCircle2, Circle, AlertCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { toast } from 'sonner';

// Subcomponentes
import DadosPessoaisTab from './components/DadosPessoaisTab';
import FormacaoTab from './components/FormacaoTab';
import ExperienciaTab from './components/ExperienciaTab';
import CompetenciasTab from './components/CompetenciasTab';
import IdiomasTab from './components/IdiomasTab';
import CursosTab from './components/CursosTab';
import ConfiguracoesTab from './components/ConfiguracoesTab';
import InteressesTab from './components/InteressesTab';
import PreviewModal from './components/PreviewModal'; // O componente modal que vamos criar

export default function PerfilCandidatoPage() {
  const [activeTab, setActiveTab] = useState('dados');
  const [completeness, setCompleteness] = useState(0);
  const [missingTips, setMissingTips] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, 'DONE' | 'PENDING' | 'WARNING'>>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('TRIAL');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    calculateCompleteness();

    const handleProfileUpdate = () => {
      calculateCompleteness();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  async function calculateCompleteness() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let score = 0;
    const tips = [];
    const newStatusMap: Record<string, 'DONE' | 'PENDING' | 'WARNING'> = {
      'dados': 'WARNING',
      'formacao': 'PENDING',
      'experiencia': 'PENDING',
      'competencias': 'PENDING',
      'idiomas': 'PENDING',
      'cursos': 'PENDING',
      'interesses': 'PENDING',
      'configuracoes': 'DONE'
    };

    // 1. Checar Cadastro Básico (Auth) = 10%
    score += 10;

    const { data: profile } = await supabase.from('profiles').select('id, nome, telefone').eq('auth_user_id', user.id).single();
    if (profile && profile.nome) score += 10;

    const { data: candidate } = await supabase.from('candidates').select('*').eq('profile_id', profile?.id).maybeSingle();
    
    // 2. Dados Pessoais (Candidato) = 30%
    if (candidate) {
      if (candidate.subscription_status) setSubscriptionStatus(candidate.subscription_status);
      const url = candidate.resumeUrl || candidate.resume_url;
      if (url) setResumeUrl(url);
      
      if (profile?.telefone && candidate.city && candidate.desired_role) {
        score += 30;
        newStatusMap['dados'] = 'DONE';
      } else {
        if (profile?.telefone || candidate.city) score += 10;
        tips.push('Dados Pessoais');
        newStatusMap['dados'] = 'WARNING';
      }
      
      // 3. Formação = 15%
      const { data: edu } = await supabase.from('candidate_education').select('id').eq('candidate_id', candidate.id);
      if (edu && edu.length > 0) {
        score += 15;
        newStatusMap['formacao'] = 'DONE';
      } else {
        tips.push('Formação Acadêmica');
      }

      // 4. Experiência = 15%
      const { data: exp } = await supabase.from('candidate_experiences').select('id').eq('candidate_id', candidate.id);
      if (exp && exp.length > 0) {
        score += 15;
        newStatusMap['experiencia'] = 'DONE';
      } else {
        tips.push('Experiência Profissional');
      }

      // Outras abas
      const { data: skills } = await supabase.from('candidate_skills').select('id').eq('candidate_id', candidate.id);
      if (skills && skills.length > 0) {
        score += 5;
        newStatusMap['competencias'] = 'DONE';
      }

      const { data: langs } = await supabase.from('candidate_languages').select('id').eq('candidate_id', candidate.id);
      if (langs && langs.length > 0) {
        score += 5;
        newStatusMap['idiomas'] = 'DONE';
      }

      const { data: courses } = await supabase.from('candidate_courses').select('id').eq('candidate_id', candidate.id);
      if (courses && courses.length > 0) {
        score += 5;
        newStatusMap['cursos'] = 'DONE';
      }

      const { data: interests } = await supabase.from('candidate_professional_interests').select('id').eq('candidate_id', candidate.id);
      if (interests && interests.length > 0) {
        score += 5;
        newStatusMap['interesses'] = 'DONE';
      }
      
      // Ajuste para não passar de 100
      if (score < 100 && score > 30) score += (100 - score) > 0 ? 0 : 0; // The math above sums up to 100
    }

    setCompleteness(Math.min(100, score));
    setMissingTips(tips);
    setStatusMap(newStatusMap);
  }

  const tabs = [
    { id: 'dados', label: 'Dados Pessoais', icon: <User size={18} /> },
    { id: 'formacao', label: 'Formação', icon: <GraduationCap size={18} /> },
    { id: 'experiencia', label: 'Experiência', icon: <Briefcase size={18} /> },
    { id: 'competencias', label: 'Competências', icon: <Star size={18} /> },
    { id: 'idiomas', label: 'Idiomas', icon: <Languages size={18} /> },
    { id: 'cursos', label: 'Cursos', icon: <FileText size={18} /> },
    { id: 'interesses', label: 'Interesses', icon: <Star size={18} /> },
    { id: 'configuracoes', label: 'Visibilidade', icon: <Settings size={18} /> },
  ];

  const getStatusIcon = (status: 'DONE' | 'PENDING' | 'WARNING') => {
    switch (status) {
      case 'DONE': return <CheckCircle2 size={16} className={styles.navItemStatusDone} />;
      case 'WARNING': return <AlertCircle size={16} className={styles.navItemStatusWarning} />;
      default: return <Circle size={16} className={styles.navItemStatusPending} />;
    }
  };

  const getStatusChecklistIcon = (status: 'DONE' | 'PENDING' | 'WARNING') => {
    switch (status) {
      case 'DONE': return <CheckCircle2 size={14} className={styles.checklistIconDone} />;
      default: return <Circle size={14} className={styles.checklistIconPending} />;
    }
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>Meu Perfil Profissional</h1>
            {subscriptionStatus === 'ACTIVE' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]">
                <Star size={10} className="fill-emerald-400" /> PREMIUM
              </span>
            )}
          </div>
          <p className={styles.subtitle}>Complete seu perfil para aumentar suas chances de encontrar as melhores oportunidades.</p>
        </div>
        
        <div className={styles.actionsWrapper}>
          <button 
            className={styles.btnTertiary} 
            onClick={() => setPreviewOpen(true)}
          >
            <Eye size={18} /> Visualizar Perfil
          </button>
          
          {resumeUrl ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a href={resumeUrl} target="_blank" rel="noreferrer" className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#FFF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <FileText size={18} /> Ver Currículo
              </a>
              <label className={styles.btnAI} htmlFor="cv-upload">
                <span id="cv-upload-label">Substituir</span>
              </label>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const { updateCandidateResumeUrl } = await import('../actions');
                    const saveRes = await updateCandidateResumeUrl(null);
                    if (saveRes.success) {
                      setResumeUrl(null);
                      toast.success('Currículo removido com sucesso!');
                    }
                  } catch (err: any) {
                    toast.error('Erro ao remover currículo');
                  }
                }}
                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Remover Currículo"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <label className={styles.btnAI} htmlFor="cv-upload">
              <FileText size={18} />
              <span id="cv-upload-label">Anexar Currículo (PDF)</span>
            </label>
          )}
          <input 
            type="file" 
            id="cv-upload" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > 5 * 1024 * 1024) {
                toast.error('O currículo não pode exceder 5MB.');
                e.target.value = '';
                return;
              }

              const label = document.getElementById('cv-upload-label');
              if (label) label.innerText = 'Enviando arquivo...';

              try {
                // Upload para o Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `resume_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `resumes/${fileName}`;

                const { error: uploadError } = await supabase.storage
                  .from('public_assets')
                  .upload(filePath, file);

                if (uploadError) {
                  console.error('Erro detalhado do Supabase:', uploadError);
                  throw new Error(`Erro no Supabase: ${uploadError.message}`);
                }
                
                const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);

                if (label) label.innerText = 'Salvando no perfil...';

                // Salvar a URL no banco de dados via Server Action
                const { updateCandidateResumeUrl } = await import('../actions');
                const saveRes = await updateCandidateResumeUrl(publicUrl);

                if (saveRes.success) {
                  setResumeUrl(publicUrl);
                  toast.success('Currículo anexado com sucesso!');
                } else {
                  throw new Error('Falha ao salvar URL no perfil.');
                }

              } catch (err: any) {
                console.error(err);
                toast.error('Erro ao enviar currículo: ' + err.message);
              } finally {
                if (label) label.innerText = 'Anexar Currículo (PDF)';
                e.target.value = ''; // Limpar o input
              }
            }}
          />
        </div>
      </div>
      
      {/* CARD PROGRESSO HORIZONTAL (Substituído por NoticeBanner) */}
      <NoticeBanner
        type={completeness === 100 ? 'success' : 'warning'}
        icon={completeness === 100 ? CheckCircle2 : AlertCircle}
        title={completeness === 100 ? 'Perfil Campeão!' : 'Seu perfil está incompleto'}
        className="mb-8 max-w-[1200px] mx-auto w-[95%]"
        description={
          <div className="w-full mt-2 flex flex-col gap-4">
            <p>
              {completeness === 100 
                ? 'Você tem altas chances de ser notado pelos recrutadores.' 
                : 'Complete seu perfil para aumentar sua relevância e ser visto por mais empresas.'}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">{completeness}%</span>
              <div className={styles.progressBarBg} style={{ flex: 1, margin: 0 }}>
                <div className={styles.progressBarFill} style={{ width: `${completeness}%` }} />
              </div>
            </div>
            
            <div className={styles.checklist}>
              <span className={styles.checklistItem} onClick={() => setActiveTab('dados')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['dados'])}</span> Dados pessoais
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('formacao')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['formacao'])}</span> Formação
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('experiencia')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['experiencia'])}</span> Experiência
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('competencias')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['competencias'])}</span> Competências
              </span>
            </div>
          </div>
        }
        action={completeness < 100 ? {
          label: 'Completar perfil',
          onClick: () => {
            const firstPending = ['dados', 'formacao', 'experiencia', 'competencias'].find(t => statusMap[t] !== 'DONE');
            if (firstPending) setActiveTab(firstPending);
          }
        } : undefined}
      />

      <div className={styles.contentLayout}>
        {/* NAVEGAÇÃO LATERAL (STEPPER) */}
        <div className={styles.sidebarNav}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const status = statusMap[tab.id] || 'PENDING';
            
            return (
              <button
                key={tab.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className={styles.navItemLeft}>
                  {tab.icon}
                  {tab.label}
                </div>
                <div className={styles.navItemStatus}>
                  {getStatusIcon(status)}
                </div>
              </button>
            )
          })}
        </div>

        {/* CONTEÚDO DINÂMICO PRINCIPAL */}
        <div className={styles.tabContent}>
          {activeTab === 'dados' && <DadosPessoaisTab />}
          {activeTab === 'formacao' && <FormacaoTab />}
          {activeTab === 'experiencia' && <ExperienciaTab />}
          {activeTab === 'competencias' && <CompetenciasTab />}
          {activeTab === 'idiomas' && <IdiomasTab />}
          {activeTab === 'cursos' && <CursosTab />}
          {activeTab === 'interesses' && <InteressesTab />}
          {activeTab === 'configuracoes' && <ConfiguracoesTab />}
        </div>
      </div>
      
      {/* MODAL DE PREVIEW */}
      {previewOpen && (
        <PreviewModal onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
