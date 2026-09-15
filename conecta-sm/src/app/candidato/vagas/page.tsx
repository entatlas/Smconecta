'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, Filter, Heart, HeartOff, Clock, Building2 } from 'lucide-react'
import { getPublicJobs, saveJob, unsaveJob, getSavedJobIds } from '../actions'
import { toast } from 'sonner'

const MODALITIES = ['Remoto', 'Híbrido', 'Presencial']
const TYPES = ['CLT', 'PJ', 'ESTAGIO']

export default function BuscarVagas() {
  const [jobs, setJobs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState('')
  const [modality, setModality] = useState('')
  const [hiringType, setHiringType] = useState('')
  const [page, setPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPublicJobs({ search, modality, hiringType, page })
      setJobs(res.jobs)
      setTotal(res.pagination.total)
    } catch {
      toast.error('Erro ao buscar vagas.')
    } finally {
      setLoading(false)
    }
  }, [search, modality, hiringType, page])

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchJobs()
      getSavedJobIds().then(ids => setSavedIds(new Set(ids))).catch(() => {})
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [fetchJobs])

  const handleSaveToggle = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (savedIds.has(jobId)) {
        await unsaveJob(jobId)
        setSavedIds(prev => { const s = new Set(prev); s.delete(jobId); return s })
        toast.success('Vaga removida dos salvos.')
      } else {
        const res = await saveJob(jobId)
        if (res.error) {
          toast.error(res.error)
          return
        }
        setSavedIds(prev => new Set(prev).add(jobId))
        toast.success('Vaga salva!')
      }
    } catch { toast.error('Faça login para salvar vagas.') }
  }

  const formatSalary = (job: any) => {
    if (!job.salaryVisibility) return 'A combinar'
    if (job.salaryMin && job.salaryMax) {
      return `R$ ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
    }
    return 'A combinar'
  }

  const formatDate = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Há 1 dia'
    if (diff < 30) return `Há ${diff} dias`
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#EAF2FF' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>Encontrar Vagas</h1>
        <p style={{ color: '#9BAFC8', marginTop: '0.25rem' }}>
          Encontre oportunidades que combinam com seu perfil.
        </p>
        <p style={{ color: '#00D9FF', marginTop: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          {total > 0 ? `${total} vaga${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ background: '#061A32', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid rgba(0, 140, 255, 0.2)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#031225', borderRadius: '8px', padding: '0.6rem 1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Search size={18} color="#0878FF" />
          <input
            type="text"
            placeholder="Cargo, palavra-chave ou área..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', width: '100%', color: '#FFFFFF' }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select value={modality} onChange={e => { setModality(e.target.value); setPage(1) }}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', background: '#031225', fontSize: '0.9rem', color: '#EAF2FF', outline: 'none' }}>
          <option value="">Todas modalidades</option>
          {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={hiringType} onChange={e => { setHiringType(e.target.value); setPage(1) }}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', background: '#031225', fontSize: '0.9rem', color: '#EAF2FF', outline: 'none' }}>
          <option value="">Todos os tipos</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => { setSearch(''); setModality(''); setHiringType(''); setPage(1) }}
          style={{ padding: '0.6rem 1rem', background: 'transparent', color: '#9BAFC8', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={e => e.currentTarget.style.color = '#9BAFC8'}>
          Limpar Filtros
        </button>
      </div>

      {/* Job List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: '160px', background: '#061A32', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#061A32', borderRadius: '12px', border: '1px dashed rgba(0, 140, 255, 0.3)' }}>
          <Search size={48} color="#0878FF" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>Nenhuma vaga encontrada</h3>
          <p style={{ color: '#9BAFC8', fontSize: '0.9rem' }}>Tente outros termos ou remova os filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <Link key={job.id} href={`/candidato/vagas/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#061A32', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(0, 140, 255, 0.1)', transition: 'all 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0878FF'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 140, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>{job.title}</h2>
                    </div>
                    
                    <p style={{ color: '#9BAFC8', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={16} /> {job.company}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {(job.city || job.companyCity) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <MapPin size={12} color="#00D9FF" /> {job.city || job.companyCity}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <Briefcase size={12} color="#00D9FF" /> {job.modality}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {job.employmentType}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#00D9FF', fontWeight: 600, background: 'rgba(0, 217, 255, 0.1)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                        {formatSalary(job)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem', marginLeft: '1rem' }}>
                    <button onClick={e => handleSaveToggle(e, job.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      title={savedIds.has(job.id) ? 'Remover dos salvos' : 'Salvar vaga'}>
                      {savedIds.has(job.id) ? <Heart size={22} color="#00D9FF" fill="#00D9FF" /> : <Heart size={22} color="#9BAFC8" />}
                    </button>
                    
                    <span style={{ fontSize: '0.75rem', color: '#9BAFC8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> Publicada {formatDate(job.createdAt).toLowerCase()}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0878FF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Ver oportunidade
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#475569' : '#EAF2FF' }}>
            Anterior
          </button>
          <span style={{ padding: '0.5rem 1rem', color: '#9BAFC8', fontSize: '0.9rem' }}>
            Página {page} de {Math.ceil(total / 15)}
          </span>
          <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'transparent', cursor: page >= Math.ceil(total / 15) ? 'not-allowed' : 'pointer', color: page >= Math.ceil(total / 15) ? '#475569' : '#EAF2FF' }}>
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
