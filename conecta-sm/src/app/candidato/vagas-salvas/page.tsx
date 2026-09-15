'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Briefcase, Trash2, ArrowRight } from 'lucide-react'
import { getSavedJobs, unsaveJob } from '../actions'
import { toast } from 'sonner'

export default function VagasSalvasPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    try {
      const data = await getSavedJobs()
      setJobs(data)
    } catch {
      toast.error('Erro ao carregar vagas salvas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSaved() }, [])

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await unsaveJob(jobId)
      setJobs(prev => prev.filter(j => j.jobId !== jobId))
      toast.success('Vaga removida dos salvos.')
    } catch {
      toast.error('Erro ao remover vaga.')
    }
  }

  if (loading) return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: '130px', background: '#061A32', borderRadius: '12px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />)}
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: '#EAF2FF' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Heart size={24} color="#00D9FF" fill="#00D9FF" /> Vagas Salvas
        </h1>
        <p style={{ color: '#9BAFC8', marginTop: '0.25rem' }}>
          {jobs.length > 0 ? `${jobs.length} vaga${jobs.length !== 1 ? 's' : ''} salva${jobs.length !== 1 ? 's' : ''}` : 'Nenhuma vaga salva ainda.'}
        </p>
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#061A32', borderRadius: '12px', border: '1px dashed rgba(0, 140, 255, 0.3)' }}>
          <Heart size={48} color="#00D9FF" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>Nenhuma vaga salva</h3>
          <p style={{ color: '#9BAFC8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ao navegar pelas vagas, clique no ícone ❤️ para salvar as que mais interessam.
          </p>
          <Link href="/candidato/vagas"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#0878FF', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#008CFF'}
            onMouseLeave={e => e.currentTarget.style.background = '#0878FF'}>
            Explorar Vagas <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <Link key={job.savedId} href={`/candidato/vagas/${job.jobId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#061A32', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid rgba(0, 140, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0878FF'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 140, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', margin: '0 0 0.25rem' }}>{job.title}</h3>
                  <p style={{ color: '#9BAFC8', fontWeight: 500, fontSize: '0.9rem', margin: '0 0 0.6rem' }}>{job.company}</p>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {job.city && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <MapPin size={11} color="#00D9FF" /> {job.city}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#EAF2FF', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <Briefcase size={11} color="#00D9FF" /> {job.modality}
                    </span>
                    {job.status === 'CLOSED' && (
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', background: 'rgba(220, 38, 38, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600, border: '1px solid #dc2626' }}>Encerrada</span>
                    )}
                    {job.status === 'PAUSED' && (
                      <span style={{ fontSize: '0.75rem', color: '#d97706', background: 'rgba(217, 119, 6, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600, border: '1px solid #d97706' }}>Pausada</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button onClick={e => handleRemove(e, job.jobId)}
                    title="Remover dos salvos"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Trash2 size={13} /> Remover
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#9BAFC8' }}>
                    Salvo em {new Date(job.savedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
