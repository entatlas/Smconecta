'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ArrowRight, XCircle } from 'lucide-react'
import { getMyCandidatures, withdrawApplication } from '../actions'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SENT:       { label: 'Enviada',          color: '#9BAFC8', bg: 'rgba(255, 255, 255, 0.05)', icon: <CheckCircle size={14} /> },
  IN_REVIEW:  { label: 'Em Análise',       color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: <Clock size={14} /> },
  REVIEWING:  { label: 'Em Análise',       color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: <Clock size={14} /> },
  SHORTLISTED:{ label: 'Pré-selecionado',  color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.1)', icon: <CheckCircle size={14} /> },
  INTERVIEW:  { label: 'Entrevista',       color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', icon: <Clock size={14} /> },
  APPROVED:   { label: 'Aprovado(a)! 🎉',  color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', icon: <CheckCircle size={14} /> },
  HIRED:      { label: 'Contratado(a)! 🎉', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <CheckCircle size={14} /> },
  REJECTED:   { label: 'Finalizado',       color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', icon: <AlertCircle size={14} /> },
  WITHDRAWN:  { label: 'Retirada',         color: '#9BAFC8', bg: 'rgba(255, 255, 255, 0.05)', icon: <AlertCircle size={14} /> },
}

const STATUS_STEPS = ['SENT', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'APPROVED']

const FILTER_TABS = [
  { key: 'ALL',       label: 'Todas' },
  { key: 'REVIEWING', label: 'Em Análise' },
  { key: 'INTERVIEW', label: 'Entrevista' },
  { key: 'APPROVED',  label: 'Aprovadas' },
  { key: 'REJECTED',  label: 'Encerradas' },
]

export default function MinhasCandidaturas() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    getMyCandidatures(filter)
      .then(data => { setApplications(data); setLoading(false) })
      .catch(() => { toast.error('Erro ao carregar candidaturas.'); setLoading(false) })
  }

  useEffect(() => {
    loadData()
  }, [filter])

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Tem certeza que deseja desistir desta vaga? A empresa será notificada e a ação não poderá ser desfeita.')) return
    try {
      await withdrawApplication(appId)
      toast.success('Candidatura retirada com sucesso.')
      loadData()
    } catch (err) {
      toast.error('Erro ao retirar candidatura.')
    }
  }

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || { label: status, color: '#9BAFC8', bg: 'rgba(255, 255, 255, 0.05)', icon: null }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: '#EAF2FF' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>Minhas Candidaturas</h1>
        <p style={{ color: '#9BAFC8', marginTop: '0.25rem' }}>Acompanhe o status de cada processo seletivo.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s',
              borderColor: filter === tab.key ? '#0878FF' : 'rgba(255, 255, 255, 0.1)',
              background: filter === tab.key ? 'rgba(8, 120, 255, 0.1)' : 'transparent',
              color: filter === tab.key ? '#00D9FF' : '#9BAFC8'
            }}
            onMouseEnter={e => { if (filter !== tab.key) e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { if (filter !== tab.key) e.currentTarget.style.color = '#9BAFC8' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '120px', background: '#061A32', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#061A32', borderRadius: '12px', border: '1px dashed rgba(0, 140, 255, 0.3)' }}>
          <FileText size={48} color="#0878FF" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>Nenhuma candidatura encontrada</h3>
          <p style={{ color: '#9BAFC8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {filter === 'ALL' ? 'Você ainda não se candidatou a nenhuma vaga.' : 'Nenhuma candidatura com este filtro.'}
          </p>
          <Link href="/candidato/vagas"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#0878FF', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#008CFF'}
            onMouseLeave={e => e.currentTarget.style.background = '#0878FF'}>
            Encontrar Vagas <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map(app => {
            const statusConf = getStatusConfig(app.status)
            const isExpanded = expanded === app.id
            const stepIdx = STATUS_STEPS.indexOf(app.status)

            return (
              <div key={app.id} style={{ background: '#061A32', borderRadius: '12px', border: `1px solid rgba(0, 140, 255, 0.1)`, transition: 'all 0.2s', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', margin: '0 0 0.2rem' }}>{app.jobTitle}</h3>
                      <p style={{ color: '#9BAFC8', fontSize: '0.9rem', margin: '0 0 0.75rem', fontWeight: 500 }}>{app.company}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: statusConf.bg, color: statusConf.color, fontWeight: 700, fontSize: '0.8rem' }}>
                          {statusConf.icon} {statusConf.label}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#9BAFC8' }}>
                          Candidatou-se em {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'transparent', color: '#9BAFC8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9BAFC8'}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Fechar' : 'Histórico'}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {!['REJECTED', 'WITHDRAWN'].includes(app.status) && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= stepIdx ? '#0878FF' : 'rgba(255, 255, 255, 0.05)', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        {['Enviada', 'Em Análise', 'Shortlist', 'Entrevista', 'Resultado'].map((label, i) => (
                          <span key={label} style={{ fontSize: '0.65rem', color: i <= stepIdx ? '#00D9FF' : '#9BAFC8', fontWeight: i <= stepIdx ? 600 : 400 }}>{label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline Expandida */}
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>Histórico de Etapas</h4>
                    {app.history.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: '#9BAFC8' }}>Candidatura enviada. Aguardando retorno da empresa.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.75rem', borderLeft: '2px solid rgba(255, 255, 255, 0.1)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0878FF', marginLeft: '-1.35rem', marginTop: '0.2rem', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Candidatura Enviada</p>
                            <p style={{ fontSize: '0.75rem', color: '#9BAFC8', margin: '0.15rem 0 0' }}>{new Date(app.appliedAt).toLocaleString('pt-BR')}</p>
                          </div>
                        </li>
                        {app.history.map((h: any, i: number) => {
                          const hConf = getStatusConfig(h.to)
                          return (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.75rem', borderLeft: '2px solid rgba(255, 255, 255, 0.1)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: hConf.color, marginLeft: '-1.35rem', marginTop: '0.2rem', flexShrink: 0 }} />
                              <div>
                                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{hConf.label}</p>
                                <p style={{ fontSize: '0.75rem', color: '#9BAFC8', margin: '0.15rem 0 0' }}>{new Date(h.at).toLocaleString('pt-BR')}</p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* Ações */}
                {isExpanded && !['REJECTED', 'WITHDRAWN', 'HIRED'].includes(app.status) && (
                  <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleWithdraw(app.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)' }}>
                      <XCircle size={16} /> Desistir da Vaga
                    </button>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
