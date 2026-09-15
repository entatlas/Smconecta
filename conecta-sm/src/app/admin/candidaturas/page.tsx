'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Briefcase, FileText, Calendar, ChevronRight, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import { getApplications } from './actions'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SENT: { label: 'Recebida', color: '#9BAFC8', bg: 'rgba(155, 175, 200, 0.1)' },
  IN_REVIEW: { label: 'Em Análise', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  SHORTLISTED: { label: 'Pré-selecionado', color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.1)' },
  INTERVIEW: { label: 'Entrevista', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  APPROVED: { label: 'Aprovado', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  REJECTED: { label: 'Reprovado', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  WITHDRAWN: { label: 'Desistiu', color: '#9BAFC8', bg: 'rgba(155, 175, 200, 0.1)' },
}

export default function CandidaturasPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      load()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, statusFilter])

  const load = async () => {
    setLoading(true)
    const { applications } = await getApplications({ search, status: statusFilter })
    setApplications(applications)
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Candidaturas Recebidas</h1>
          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1rem' }}>Avalie e gerencie os candidatos inscritos nas vagas da plataforma.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={18} color="#8B9BB4" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por candidato, e-mail ou vaga..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
              background: '#031225', border: '1px solid #11284A', borderRadius: '8px', 
              color: '#EAF2FF', fontSize: '0.9rem', outline: 'none' 
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ 
            padding: '0.75rem 1rem', background: '#031225', border: '1px solid #11284A', 
            borderRadius: '8px', color: '#EAF2FF', fontSize: '0.9rem', outline: 'none',
            cursor: 'pointer', minWidth: '180px'
          }}
        >
          <option value="">Todos os status</option>
          <option value="SENT">Recebidas</option>
          <option value="IN_REVIEW">Em análise</option>
          <option value="SHORTLISTED">Pré-selecionados</option>
          <option value="INTERVIEW">Entrevista</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Reprovados</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B9BB4' }}>Carregando candidaturas...</div>
        ) : applications.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <FileText size={48} color="rgba(0, 217, 255, 0.2)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#EAF2FF', fontSize: '1.2rem' }}>Nenhuma candidatura encontrada</h3>
            <p style={{ margin: 0, color: '#8B9BB4' }}>Ajuste os filtros ou aguarde novas inscrições.</p>
          </div>
        ) : (
          <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(6, 26, 50, 0.5)', borderBottom: '1px solid #11284A', textAlign: 'left' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#8B9BB4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Candidato</th>
                <th style={{ padding: '1rem 1.5rem', color: '#8B9BB4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Vaga</th>
                <th style={{ padding: '1rem 1.5rem', color: '#8B9BB4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Data</th>
                <th style={{ padding: '1rem 1.5rem', color: '#8B9BB4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: '#8B9BB4', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.SENT;
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #11284A', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#061A32', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {app.candidateAvatar ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <Image src={app.candidateAvatar} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <UserIcon size={20} color="#00D9FF" />
                          )}
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>{app.candidateName}</p>
                          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.8rem' }}>{[app.city, app.state].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#00D9FF', fontSize: '0.95rem' }}>{app.jobTitle}</p>
                      <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.8rem' }}>{app.companyName}</p>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#EAF2FF', fontSize: '0.9rem' }}>
                      {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '999px',
                        background: statusInfo.bg, color: statusInfo.color, fontSize: '0.8rem', fontWeight: 700
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => router.push(`/admin/candidaturas/${app.id}`)}
                        style={{ 
                          background: 'transparent', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '6px',
                          color: '#00D9FF', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Ver Dossiê
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

    </div>
  )
}
