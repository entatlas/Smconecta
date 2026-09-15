'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Briefcase, Calendar, CheckCircle, ExternalLink, MessageSquare, Save, ChevronDown, Lock } from 'lucide-react'
import { getApplicationDetails, changeApplicationStatus, addInternalNote } from '../actions'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

const STATUS_OPTIONS = [
  { value: 'SENT', label: 'Recebida' },
  { value: 'IN_REVIEW', label: 'Em Análise' },
  { value: 'SHORTLISTED', label: 'Pré-selecionado' },
  { value: 'INTERVIEW', label: 'Entrevista' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Reprovado' },
  { value: 'WITHDRAWN', label: 'Desistiu' },
]

export default function CandidaturaDossie() {
  const { id } = useParams()
  const router = useRouter()
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    setLoading(true)
    const data = await getApplicationDetails(id as string)
    setApp(data)
    setLoading(false)
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setChangingStatus(true)
    try {
      await changeApplicationStatus(id as string, newStatus)
      toast.success('Status da candidatura atualizado!')
      load()
    } catch (err) {
      toast.error('Erro ao atualizar status')
    } finally {
      setChangingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    setAddingNote(true)
    try {
      await addInternalNote(id as string, note)
      toast.success('Observação adicionada com sucesso')
      setNote('')
      load()
    } catch {
      toast.error('Erro ao adicionar observação')
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#8B9BB4' }}>
      Carregando dossiê do candidato...
    </div>
  )

  if (!app) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#8B9BB4' }}>
      Candidatura não encontrada.
    </div>
  )

  // Use snapshotData for rendering the profile to keep the temporal integrity
  const snapshot = app.snapshotData || {}
  const profile = (snapshot.profile && snapshot.profile.id) ? snapshot.profile : app.candidate.profile
  const candidate = (snapshot.candidate && snapshot.candidate.id) ? snapshot.candidate : app.candidate
  const notes = app.internalNotes || []

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto text-[#EAF2FF] min-h-screen">
      
      {/* Header and Back */}
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={18} /> Voltar para lista
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        
        {/* Left Column: Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Card */}
          <div className="bg-[#031225] border border-[#11284A] rounded-xl p-4 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#061A32', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {profile.avatar_url ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image src={profile.avatar_url} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <UserIcon size={40} color="#00D9FF" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 0.2rem', fontSize: '1.75rem', fontWeight: 800, color: '#EAF2FF', wordBreak: 'break-word' }}>{profile.nome}</h1>
              <p style={{ margin: '0 0 1rem', color: '#00D9FF', fontWeight: 600, fontSize: '1.1rem' }}>
                {candidate.headline || candidate.desiredRole || 'Candidato'}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-4 text-[#8B9BB4] text-sm">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}><MapPin size={16} /> {[candidate.city, candidate.state].filter(Boolean).join(', ')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}><Mail size={16} /> {profile.email}</span>
                {profile.telefone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}><Phone size={16} /> {profile.telefone}</span>}
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', borderBottom: '1px solid #11284A', paddingBottom: '0.75rem' }}>Sobre o candidato</h3>
            {candidate.about ? (
              <p style={{ margin: 0, color: '#EAF2FF', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{candidate.about}</p>
            ) : (
              <p style={{ margin: 0, color: '#8B9BB4', fontStyle: 'italic' }}>Candidato ainda não adicionou um resumo profissional.</p>
            )}
          </div>

          {/* Experience */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', borderBottom: '1px solid #11284A', paddingBottom: '0.75rem' }}>Experiência Profissional</h3>
            {snapshot.experiences?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {snapshot.experiences.map((exp: any, i: number) => (
                  <div key={i}>
                    <h4 style={{ margin: '0 0 0.2rem', color: '#EAF2FF', fontWeight: 600, fontSize: '1.1rem' }}>{exp.company}</h4>
                    <p style={{ margin: '0 0 0.5rem', color: '#00D9FF', fontSize: '0.95rem' }}>{exp.role}</p>
                    <p style={{ margin: '0 0 0.75rem', color: '#8B9BB4', fontSize: '0.85rem' }}>
                      {new Date(exp.startDate).getFullYear()} — {exp.isCurrent ? 'Atual' : new Date(exp.endDate).getFullYear()}
                    </p>
                    {exp.activities && <p style={{ margin: 0, color: '#EAF2FF', fontSize: '0.9rem', lineHeight: 1.5 }}>{exp.activities}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#8B9BB4', fontStyle: 'italic' }}>Nenhuma experiência profissional cadastrada.</p>
            )}
          </div>

          {/* Education */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', borderBottom: '1px solid #11284A', paddingBottom: '0.75rem' }}>Formação Acadêmica</h3>
            {snapshot.education?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {snapshot.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h4 style={{ margin: '0 0 0.2rem', color: '#EAF2FF', fontWeight: 600, fontSize: '1.1rem' }}>{edu.course}</h4>
                    <p style={{ margin: '0 0 0.5rem', color: '#00D9FF', fontSize: '0.95rem' }}>{edu.institution}</p>
                    <p style={{ margin: '0', color: '#8B9BB4', fontSize: '0.85rem' }}>
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} — {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Em andamento'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#8B9BB4', fontStyle: 'italic' }}>Nenhuma formação cadastrada.</p>
            )}
          </div>

          {/* Skills & Languages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', borderBottom: '1px solid #11284A', paddingBottom: '0.75rem' }}>Competências</h3>
              {snapshot.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {snapshot.skills.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #11284A', paddingBottom: '0.5rem' }}>
                      <span style={{ color: '#EAF2FF' }}>{s.name}</span>
                      <span style={{ color: '#8B9BB4', fontSize: '0.85rem' }}>{s.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#8B9BB4', fontStyle: 'italic' }}>Nenhuma competência.</p>
              )}
            </div>

            <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', borderBottom: '1px solid #11284A', paddingBottom: '0.75rem' }}>Idiomas</h3>
              {snapshot.languages?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {snapshot.languages.map((l: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #11284A', paddingBottom: '0.5rem' }}>
                      <span style={{ color: '#EAF2FF' }}>{l.language}</span>
                      <span style={{ color: '#8B9BB4', fontSize: '0.85rem' }}>{l.understanding}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#8B9BB4', fontStyle: 'italic' }}>Nenhum idioma.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Actions & Job */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Actions & Status */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>Ações e Status</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '0.5rem' }}>Status da Candidatura</label>
              <select
                disabled={changingStatus}
                value={app.status}
                onChange={handleStatusChange}
                style={{ 
                  width: '100%', padding: '0.75rem', background: '#061A32', border: '1px solid rgba(0, 217, 255, 0.3)', 
                  borderRadius: '8px', color: '#EAF2FF', fontSize: '0.95rem', outline: 'none', cursor: 'pointer'
                }}
              >
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href={`/admin/candidatos/${profile.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>
                <UserIcon size={16} /> Ver perfil completo
              </Link>
              
              {(app.resumeUrl || app.candidate?.resumeUrl) && (
                <a href={app.resumeUrl || app.candidate?.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>
                  <ExternalLink size={16} /> Ver Currículo Anexo
                </a>
              )}
            </div>
          </div>

          {/* Job Summary */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>Dados da Vaga</h3>
            
            <p style={{ margin: '0 0 0.2rem', color: '#00D9FF', fontWeight: 600, fontSize: '1.05rem' }}>{app.job.title}</p>
            <p style={{ margin: '0 0 1rem', color: '#8B9BB4', fontSize: '0.9rem' }}>{app.job.company.tradeName}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#8B9BB4' }}>Local:</span>
                <span style={{ color: '#EAF2FF', fontWeight: 500 }}>{[app.job.city, app.job.state].filter(Boolean).join(', ') || 'Remoto'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#8B9BB4' }}>Modalidade:</span>
                <span style={{ color: '#EAF2FF', fontWeight: 500 }}>{app.job.modality}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#8B9BB4' }}>Contrato:</span>
                <span style={{ color: '#EAF2FF', fontWeight: 500 }}>{app.job.employmentType}</span>
              </div>
            </div>

            <Link href={`/admin/vagas/${app.job.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem', background: 'transparent', color: '#8B9BB4', border: '1px solid #11284A', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
              <ExternalLink size={16} /> Ver vaga completa
            </Link>
          </div>

          {/* Internal Notes */}
          <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} /> Observações Internas
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {notes.length === 0 ? (
                <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.85rem', fontStyle: 'italic' }}>Nenhuma observação interna.</p>
              ) : (
                notes.map((n: any, i: number) => (
                  <div key={i} style={{ background: '#031225', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                    <p style={{ margin: '0 0 0.5rem', color: '#EAF2FF', fontSize: '0.85rem', lineHeight: 1.5 }}>{n.text}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8B9BB4' }}>
                      <span>{n.authorName}</span>
                      <span>{new Date(n.date).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Adicione uma nota visível apenas para administradores..."
                style={{ width: '100%', padding: '0.75rem', background: '#031225', border: '1px solid #11284A', borderRadius: '8px', color: '#EAF2FF', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', outline: 'none' }}
              />
              <button 
                onClick={handleAddNote}
                disabled={addingNote || !note.trim()}
                style={{ padding: '0.6rem', background: '#d97706', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: (!note.trim() || addingNote) ? 0.5 : 1 }}
              >
                {addingNote ? 'Adicionando...' : 'Adicionar Observação'}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>Histórico</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#11284A' }} />
              {app.history.map((h: any, i: number) => {
                const toInfo = STATUS_OPTIONS.find(s => s.value === h.newStatus)?.label || h.newStatus
                return (
                  <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#031225', border: '2px solid #00D9FF', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: '0 0 0.2rem', color: '#EAF2FF', fontSize: '0.85rem', fontWeight: 600 }}>Status alterado para "{toInfo}"</p>
                      <p style={{ margin: 0, color: '#8B9BB4', fontSize: '0.75rem' }}>{new Date(h.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
