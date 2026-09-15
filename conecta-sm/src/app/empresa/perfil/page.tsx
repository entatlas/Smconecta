'use client'

import React, { useEffect, useState, useRef } from 'react'
import { getCompanyProfile, updateCompanyProfile } from './actions'
import { toast } from 'sonner'
import { Building2, Camera, ExternalLink, MapPin, Heart, Briefcase, CheckCircle2, AlertCircle, Circle, Eye, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { NoticeBanner } from '@/components/ui/NoticeBanner'
import styles from '@/app/candidato/perfil/Perfil.module.css'

// Subcomponentes
import IdentidadeTab from './components/IdentidadeTab'
import SobreTab from './components/SobreTab'
import ContatoTab from './components/ContatoTab'
import RecrutamentoTab from './components/RecrutamentoTab'

export default function EmpresaPerfilPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('identidade')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [completeness, setCompleteness] = useState(0)
  const [statusMap, setStatusMap] = useState<Record<string, 'DONE' | 'PENDING' | 'WARNING'>>({})

  const coverInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCompanyProfile().then(res => {
      setData(res)
      calculateCompleteness(res)
      setLoading(false)
    }).catch(err => {
      toast.error('Erro ao carregar perfil.')
      setLoading(false)
    })
  }, [])

  const calculateCompleteness = (profileData: any) => {
    if (!profileData) return;
    
    let score = 0;
    const newStatusMap: Record<string, 'DONE' | 'PENDING' | 'WARNING'> = {
      'identidade': 'PENDING',
      'institucional': 'PENDING',
      'contato': 'PENDING',
      'recrutamento': 'PENDING',
    };

    // Identidade = 25%
    if (profileData.tradeName && profileData.industry) {
      score += 25;
      newStatusMap['identidade'] = 'DONE';
    } else if (profileData.tradeName || profileData.industry) {
      score += 10;
      newStatusMap['identidade'] = 'WARNING';
    }

    // Institucional = 25%
    if (profileData.description && profileData.culture) {
      score += 25;
      newStatusMap['institucional'] = 'DONE';
    } else if (profileData.description || profileData.culture) {
      score += 10;
      newStatusMap['institucional'] = 'WARNING';
    }

    // Contato = 25%
    if (profileData.city && profileData.contactEmail) {
      score += 25;
      newStatusMap['contato'] = 'DONE';
    } else if (profileData.city || profileData.contactEmail) {
      score += 10;
      newStatusMap['contato'] = 'WARNING';
    }

    // Recrutamento = 25%
    if (profileData.hrContact) {
      score += 25;
      newStatusMap['recrutamento'] = 'DONE';
    }

    setCompleteness(Math.min(100, score));
    setStatusMap(newStatusMap);
  }

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData)
    if (!hasUnsavedChanges) setHasUnsavedChanges(true)
    calculateCompleteness(newData)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, maxWidth: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let scaleSize = 1;
        if (img.width > maxWidth) {
           scaleSize = maxWidth / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        handleChange(field, canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCompanyProfile(data)
      toast.success('Perfil atualizado com sucesso!')
      setHasUnsavedChanges(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto animate-pulse space-y-6">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="flex gap-4">
          <div className="w-1/4 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="w-3/4 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-8 text-red-500 text-center font-bold">Erro ao carregar o perfil da empresa.</div>

  const tabs = [
    { id: 'identidade', label: 'Identidade', icon: <Building2 size={18} /> },
    { id: 'institucional', label: 'Sobre & Cultura', icon: <Heart size={18} /> },
    { id: 'contato', label: 'Contato & Local', icon: <MapPin size={18} /> },
    { id: 'recrutamento', label: 'Recrutamento', icon: <Briefcase size={18} /> },
  ]

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
      
      {/* HEADER PREMIUM IGUAL AO CANDIDATO */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className="flex items-center gap-3">
            <h1 className={styles.title}>Perfil da Empresa</h1>
            {data.isVerified && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30 flex items-center gap-1 shadow-[0_0_10px_-2px_rgba(59,130,246,0.3)]">
                <CheckCircle2 size={10} className="stroke-blue-400" /> VERIFICADA
              </span>
            )}
          </div>
          <p className={styles.subtitle}>Gerencie a presença pública e os dados institucionais da sua organização.</p>
        </div>
        
        <div className={styles.actionsWrapper}>
          <Link href={`/empresa/${data.id}`} target="_blank">
            <button className={styles.btnTertiary} type="button">
              <Eye size={18} /> Ver Perfil Público
            </button>
          </Link>
          <button 
            className={styles.btnPrimary} 
            onClick={handleSubmit} 
            disabled={saving || !hasUnsavedChanges}
          >
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* HEADER COM FOTO E LOGO (MÍDIAS) */}
      <div className="max-w-[1200px] mx-auto w-full mb-8 relative px-4 md:px-0">
        <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageUpload(e, 'coverUrl', 1200)} />
        <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logoUrl', 300)} />

        <div className="h-48 w-full rounded-2xl bg-[#0f1219] border border-gray-800 overflow-hidden relative group">
          {data.coverUrl ? (
            <Image src={data.coverUrl} alt="Capa da Empresa" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Camera size={48} className="opacity-50 mb-2"/>
              <span className="text-sm">Nenhuma capa adicionada</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <Button variant="outline" className="text-white border-white hover:bg-white/20" onClick={() => coverInputRef.current?.click()}>Alterar Capa</Button>
          </div>
        </div>
        
        <div className="px-8 flex flex-col gap-2 relative z-10">
          <div className="-mt-16 h-32 w-32 rounded-xl bg-slate-950 border-4 border-[#0f1219] overflow-hidden shadow-2xl relative group shrink-0">
            {data.logoUrl ? (
              <Image src={data.logoUrl} alt="Logo" fill className="object-contain bg-white" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                <Building2 size={40}/>
              </div>
            )}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer" onClick={() => logoInputRef.current?.click()}>
              <Camera size={24} className="text-white"/>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">{data.tradeName || data.companyName || 'Empresa'}</h2>
          </div>
        </div>
      </div>
      
      {/* CARD PROGRESSO HORIZONTAL (NoticeBanner IGUAL AO CANDIDATO) */}
      <NoticeBanner
        type={completeness === 100 ? 'success' : 'warning'}
        icon={completeness === 100 ? CheckCircle2 : AlertCircle}
        title={completeness === 100 ? 'Perfil Campeão!' : 'Seu perfil está incompleto'}
        className="mb-8 max-w-[1200px] mx-auto w-[95%] md:w-full"
        description={
          <div className="w-full mt-2 flex flex-col gap-4">
            <p>
              {completeness === 100 
                ? 'Sua empresa está super atrativa para os melhores talentos.' 
                : 'Complete o perfil da empresa para aumentar a atração e confiança dos candidatos.'}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">{completeness}%</span>
              <div className={styles.progressBarBg} style={{ flex: 1, margin: 0 }}>
                <div className={styles.progressBarFill} style={{ width: `${completeness}%` }} />
              </div>
            </div>
            
            <div className={styles.checklist}>
              <span className={styles.checklistItem} onClick={() => setActiveTab('identidade')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['identidade'])}</span> Identidade
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('institucional')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['institucional'])}</span> Cultura
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('contato')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['contato'])}</span> Contato
              </span>
              <span className={styles.checklistItem} onClick={() => setActiveTab('recrutamento')}>
                <span className={styles.checklistIcon}>{getStatusChecklistIcon(statusMap['recrutamento'])}</span> Recrutamento
              </span>
            </div>
          </div>
        }
        action={completeness < 100 ? {
          label: 'Completar perfil',
          onClick: () => {
            const firstPending = ['identidade', 'institucional', 'contato', 'recrutamento'].find(t => statusMap[t] !== 'DONE');
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
          <form id="empresa-form" onSubmit={handleSubmit}>
            {activeTab === 'identidade' && <IdentidadeTab data={data} handleChange={handleChange} />}
            {activeTab === 'institucional' && <SobreTab data={data} handleChange={handleChange} />}
            {activeTab === 'contato' && <ContatoTab data={data} handleChange={handleChange} />}
            {activeTab === 'recrutamento' && <RecrutamentoTab data={data} handleChange={handleChange} />}
          </form>
          
          <div className="flex justify-end pt-8 md:hidden">
            <Button onClick={handleSubmit} disabled={saving || !hasUnsavedChanges} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
