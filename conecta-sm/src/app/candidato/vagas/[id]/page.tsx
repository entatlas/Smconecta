'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle, Heart, HeartOff, AlertCircle, Building2, ExternalLink, Globe } from 'lucide-react'
import { getJobDetails, checkJobApplication, applyToJob, saveJob, unsaveJob, isJobSaved, getCandidateProfileSummary } from '../../actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import ReactMarkdown from 'react-markdown'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SENT: { label: 'Candidatura Enviada', color: '#9BAFC8', bg: 'rgba(155, 175, 200, 0.1)' },
  IN_REVIEW: { label: 'Em Análise', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  REVIEWING: { label: 'Em Análise', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  SHORTLISTED: { label: 'Pré-selecionado(a)!', color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.1)' },
  INTERVIEW: { label: 'Entrevista Agendada', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  APPROVED: { label: 'Aprovado(a)!', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  HIRED: { label: 'Contratado(a)!', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  REJECTED: { label: 'Processo Encerrado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  WITHDRAWN: { label: 'Candidatura Retirada', color: '#9BAFC8', bg: 'rgba(155, 175, 200, 0.1)' },
}

export default function DetalhesVaga() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [candidateSummary, setCandidateSummary] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    Promise.all([
      getJobDetails(id),
      checkJobApplication(id).catch(() => null),
      isJobSaved(id).catch(() => ({ saved: false })),
      getCandidateProfileSummary().catch(() => null)
    ]).then(([jobData, appData, savedData, summaryData]) => {
      setJob(jobData)
      setApplicationStatus(appData)
      setSaved(savedData?.saved ?? false)
      setCandidateSummary(summaryData)
      setLoading(false)
    })
  }, [id])

  const { execute: handleApply, isLoading: applying } = useAsyncAction(
    async () => {
      await applyToJob(id)
    },
    {
      onSuccess: () => {
        toast.success('Candidatura enviada com sucesso! 🎉')
        setApplicationStatus({ applied: true, status: 'SENT', appliedAt: new Date() })
        setShowConfirm(false)
      },
      onError: (err) => {
        toast.error(err.message || 'Erro ao enviar candidatura.')
      }
    }
  )

  const handleSaveToggle = async () => {
    try {
      if (saved) {
        await unsaveJob(id)
        setSaved(false)
        toast.success('Removida dos salvos.')
      } else {
        const res = await saveJob(id)
        if (res.error) {
          toast.error(res.error)
          return
        }
        setSaved(true)
        toast.success('Vaga salva!')
      }
    } catch { toast.error('Faça login para salvar vagas.') }
  }

  const formatSalary = () => {
    if (!job?.salaryVisibility) return 'A combinar'
    if (job?.salaryMin && job?.salaryMax) return `R$ ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}`
    return 'A combinar'
  }

  if (loading) return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ height: '300px', background: '#061A32', borderRadius: '16px', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '400px', background: '#061A32', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
    </div>
  )

  if (!job) return (
    <div style={{ padding: '4rem', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(6, 26, 50, 0.8) 0%, rgba(2, 8, 23, 1) 100%)', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <AlertCircle size={64} color="#dc2626" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(220,38,38,0.5))' }} />
      <h2 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '0.5rem' }}>Vaga não encontrada</h2>
      <p style={{ color: '#9BAFC8', fontSize: '1.1rem', marginBottom: '2rem' }}>Esta vaga pode ter sido encerrada, preenchida ou o link é inválido.</p>
      <Link href="/candidato/vagas" style={{ padding: '0.8rem 2rem', background: 'linear-gradient(90deg, #0878FF 0%, #00D9FF 100%)', color: '#031225', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)' }}>
        Explorar outras vagas
      </Link>
    </div>
  )

  const isClosed = job.status === 'CLOSED' || job.status === 'PAUSED'
  const alreadyApplied = applicationStatus?.applied
  const appStatusInfo = alreadyApplied ? (STATUS_LABELS[applicationStatus.status] || { label: applicationStatus.status, color: '#9BAFC8', bg: 'rgba(155, 175, 200, 0.1)' }) : null

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto', color: '#EAF2FF' }}>
      {/* Voltar */}
      <button 
        onClick={() => router.back()} 
        style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', 
          color: '#9BAFC8', cursor: 'pointer', fontWeight: 600, 
          marginBottom: '2rem', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '999px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#00D9FF'; e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9BAFC8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)' }}
      >
        <ArrowLeft size={16} /> Voltar para as vagas
      </button>

      {/* Header Premium Card */}
      <div style={{ 
        background: 'linear-gradient(145deg, rgba(6, 26, 50, 0.9) 0%, rgba(3, 18, 37, 0.95) 100%)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        border: '1px solid rgba(0, 140, 255, 0.15)', 
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative'
      }}>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: 'radial-gradient(ellipse, rgba(0,217,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ padding: '2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Infos da Vaga */}
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, rgba(8, 120, 255, 0.15), rgba(0, 217, 255, 0.05))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                  <Building2 size={24} color="#00D9FF" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#9BAFC8', margin: 0 }}>{job.company?.tradeName}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6A7D98', margin: '0.2rem 0 0 0' }}>{job.company?.companyName}</p>
                </div>
              </div>
              
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                {job.title}
              </h1>

              {/* Badges de Atributos */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(job.city || job.state) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 500, color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                    <MapPin size={16} color="#00D9FF" /> {[job.city, job.state].filter(Boolean).join(', ')}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 500, color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                  <Briefcase size={16} color="#00D9FF" /> {job.modality}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 500, color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                  {job.employmentType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#00D9FF', fontWeight: 700, background: 'rgba(0, 217, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid rgba(0, 217, 255, 0.2)', boxShadow: '0 0 10px rgba(0, 217, 255, 0.1)' }}>
                  {formatSalary()}
                </span>
                {job.publishedAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#6A7D98', padding: '0.5rem 0' }}>
                    <Calendar size={14} /> Publicada em {new Date(job.publishedAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* Ações / CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '300px' }}>
              {isClosed && (
                <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.05))', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 20px rgba(220, 38, 38, 0.05)' }}>
                  <AlertCircle size={28} color="#dc2626" style={{ margin: '0 auto 0.75rem', filter: 'drop-shadow(0 0 5px rgba(220,38,38,0.5))' }} />
                  <p style={{ fontSize: '1rem', color: '#ef4444', fontWeight: 700 }}>
                    {job.status === 'PAUSED' ? 'Vaga Pausada' : 'Vaga Encerrada'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(239, 68, 68, 0.8)', marginTop: '0.25rem' }}>
                    Não estamos recebendo novas candidaturas.
                  </p>
                </div>
              )}

              {!isClosed && alreadyApplied && applicationStatus.status !== 'WITHDRAWN' && appStatusInfo && (
                <div style={{ padding: '1.5rem', background: appStatusInfo.bg, border: `1px solid ${appStatusInfo.color}`, borderRadius: '16px', textAlign: 'center', boxShadow: `0 8px 20px ${appStatusInfo.bg}` }}>
                  <CheckCircle size={32} color={appStatusInfo.color} style={{ margin: '0 auto 0.75rem', filter: `drop-shadow(0 0 5px ${appStatusInfo.color})` }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: appStatusInfo.color }}>{appStatusInfo.label}</p>
                  <p style={{ fontSize: '0.85rem', color: '#EAF2FF', marginTop: '0.5rem', opacity: 0.8 }}>
                    Enviada em {applicationStatus.appliedAt ? new Date(applicationStatus.appliedAt).toLocaleDateString('pt-BR') : ''}
                  </p>
                  <Link href="/candidato/candidaturas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: '#EAF2FF', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                    Acompanhar Processo <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </Link>
                </div>
              )}

              {!isClosed && (!alreadyApplied || applicationStatus.status === 'WITHDRAWN') && !showConfirm && (
                <button onClick={() => setShowConfirm(true)}
                  style={{ 
                    padding: '1.2rem 2rem', 
                    background: 'linear-gradient(90deg, #0878FF 0%, #00D9FF 100%)', 
                    color: '#031225', 
                    border: 'none', 
                    borderRadius: '16px', 
                    fontWeight: 800, 
                    fontSize: '1.1rem', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(0, 217, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 217, 255, 0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 217, 255, 0.3)'
                  }}>
                  <Briefcase size={20} /> {applicationStatus?.status === 'WITHDRAWN' ? 'Candidatar-se Novamente' : 'Quero me candidatar'}
                </button>
              )}

              {showConfirm && (
                <div style={{ padding: '1.5rem', background: 'rgba(3, 18, 37, 0.8)', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                  <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} color="#00D9FF" /> Confirmar envio?
                  </p>
                  
                  {candidateSummary && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.85rem', color: '#9BAFC8', marginBottom: '0.75rem', fontWeight: 600 }}>Perfil que a empresa verá:</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#EAF2FF', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li><span style={{ color: '#6A7D98' }}>Nome:</span> {candidateSummary.nome}</li>
                        {candidateSummary.cargo && <li><span style={{ color: '#6A7D98' }}>Foco:</span> {candidateSummary.cargo}</li>}
                        <li><span style={{ color: '#6A7D98' }}>Métricas:</span> {candidateSummary.experiencias} exp / {candidateSummary.formacoes} form</li>
                      </ul>
                      <Link href="/candidato/perfil" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8rem', color: '#00D9FF', textDecoration: 'none', fontWeight: 500 }}>
                        Editar currículo antes
                      </Link>
                    </div>
                  )}

                  {!candidateSummary && (
                    <p style={{ fontSize: '0.85rem', color: '#9BAFC8', marginBottom: '1.25rem' }}>Seu currículo atual será enviado diretamente para o recrutador.</p>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleApply} disabled={applying}
                      style={{ flex: 1, padding: '0.8rem', background: '#0878FF', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}
                      onMouseEnter={e => !applying && (e.currentTarget.style.background = '#008CFF')}
                      onMouseLeave={e => !applying && (e.currentTarget.style.background = '#0878FF')}>
                      {applying ? 'Enviando...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setShowConfirm(false)}
                      style={{ padding: '0.8rem 1rem', background: 'transparent', color: '#9BAFC8', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9BAFC8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <button onClick={handleSaveToggle}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                  padding: '1rem', background: saved ? 'rgba(220, 38, 38, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
                  color: saved ? '#ef4444' : '#9BAFC8', 
                  border: '1px solid', borderColor: saved ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', 
                  transition: 'all 0.2s ease' 
                }}
                onMouseEnter={e => {
                  if (!saved) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#EAF2FF'
                  }
                }}
                onMouseLeave={e => {
                  if (!saved) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    e.currentTarget.style.color = '#9BAFC8'
                  }
                }}
              >
                {saved ? <HeartOff size={18} /> : <Heart size={18} />}
                {saved ? 'Remover dos salvos' : 'Salvar esta vaga'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Descrição e Requisitos */}
        <div style={{ gridColumn: '1 / -1', '@media (min-width: 900px)': { gridColumn: '1 / 3' } } as any}>
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(6, 26, 50, 0.6) 0%, rgba(6, 26, 50, 0.3) 100%)', 
            borderRadius: '20px', 
            padding: '2.5rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '4px', height: '24px', background: '#00D9FF', borderRadius: '4px' }} />
              Detalhes da Vaga
            </h3>
            
            <div className="markdown-content" style={{ color: '#C8D4E5', lineHeight: 1.8, fontSize: '1.05rem' }}>
              <style dangerouslySetInnerHTML={{__html: `
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #FFFFFF; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
                .markdown-content h1 { font-size: 1.5rem; }
                .markdown-content h2 { font-size: 1.3rem; }
                .markdown-content h3 { font-size: 1.1rem; }
                .markdown-content p { margin-bottom: 1em; }
                .markdown-content ul, .markdown-content ol { padding-left: 1.5em; margin-bottom: 1em; }
                .markdown-content li { margin-bottom: 0.5em; position: relative; }
                .markdown-content li::marker { color: #00D9FF; }
                .markdown-content strong { color: #EAF2FF; font-weight: 700; }
                .markdown-content a { color: #00D9FF; text-decoration: none; }
                .markdown-content a:hover { text-decoration: underline; }
                .markdown-content blockquote { border-left: 3px solid #00D9FF; padding-left: 1em; margin-left: 0; color: #9BAFC8; font-style: italic; }
              `}} />
              <ReactMarkdown>{job.description}</ReactMarkdown>
            </div>
            
            {job.benefits && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h3 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '4px', height: '24px', background: '#22c55e', borderRadius: '4px' }} />
                  Benefícios
                </h3>
                <div className="markdown-content" style={{ color: '#C8D4E5', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  <ReactMarkdown>{job.benefits}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Empresa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1', '@media (min-width: 900px)': { gridColumn: '3 / 4' } } as any}>
          <div style={{ 
            background: 'rgba(6, 26, 50, 0.4)', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Conheça a Empresa</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(8, 120, 255, 0.2), rgba(0, 217, 255, 0.1))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <Building2 size={32} color="#00D9FF" />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>{job.company?.tradeName}</p>
                <p style={{ fontSize: '0.9rem', color: '#9BAFC8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} /> {[job.company?.city, job.company?.state].filter(Boolean).join(', ') || 'Localização não informada'}
                </p>
              </div>
            </div>

            {job.company?.website && (
              <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', textDecoration: 'none', color: '#EAF2FF', fontSize: '0.9rem', fontWeight: 600, 
                  transition: 'all 0.2s ease' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}>
                <Globe size={16} /> Visitar site <ExternalLink size={14} style={{ opacity: 0.5, marginLeft: 'auto' }} />
              </a>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}
