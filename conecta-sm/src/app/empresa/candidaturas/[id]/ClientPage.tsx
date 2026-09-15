'use client'

import React, { useEffect, useState } from 'react'
import { getApplicationDetails, updateApplicationStatus, addInternalNote } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Briefcase, Mail, Phone, MapPin, Calendar, Clock, BookOpen, MessageSquare, Languages, FileText, Download, AlertTriangle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScheduleInterviewModal } from './components/ScheduleInterviewModal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NoticeBanner } from '@/components/ui/NoticeBanner'

export default function CandidaturaDetailsClient({ id }: { id: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const res = await getApplicationDetails(id)
      setData(res)
    } catch (err) {
      toast.error('Erro ao carregar detalhes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateApplicationStatus(id, newStatus)
      toast.success('Status atualizado com sucesso!')
      fetchDetails()
    } catch (err) {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSubmittingNote(true)
    try {
      await addInternalNote(id, noteText)
      toast.success('Nota adicionada!')
      setNoteText('')
      fetchDetails()
    } catch (err) {
      toast.error('Erro ao adicionar nota.')
    } finally {
      setSubmittingNote(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando detalhes...</div>
  if (!data) return <div className="p-8 text-center text-red-500">Candidatura não encontrada.</div>

  const profile = data.candidate.profile

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-6 mt-6">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900 relative">
          {(profile.coverUrl || (profile as any).cover_url) && (
            <img src={profile.coverUrl || (profile as any).cover_url} alt="Capa" className="w-full h-full object-cover" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/empresa/candidaturas">
            <Button variant="outline" size="icon" className="bg-slate-900 border-slate-700 hover:bg-slate-800">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          {(profile.avatarUrl || (profile as any).avatar_url) ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 flex-shrink-0">
              <img src={profile.avatarUrl || (profile as any).avatar_url} alt={profile.nome} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-slate-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.nome}</h1>
            <p className="text-muted-foreground">Candidatura para: <span className="font-semibold text-slate-200">{data.job.title}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Status:</span>
            <Select value={data.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENT">Nova</SelectItem>
                <SelectItem value="IN_REVIEW">Em Análise</SelectItem>
                <SelectItem value="SHORTLISTED">Pré-selecionado</SelectItem>
                <SelectItem value="INTERVIEW">Entrevista</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="HIRED">Contratado</SelectItem>
                <SelectItem value="REJECTED">Reprovado</SelectItem>
                <div className="border-t border-slate-700 my-1"></div>
                <SelectItem value="NO_SHOW" className="text-red-400 focus:text-red-300">Faltou na Entrevista</SelectItem>
                <SelectItem value="FIRED" className="text-red-400 focus:text-red-300">Demitido / Desligado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Calendar className="mr-2 h-4 w-4" /> Marcar Entrevista
          </Button>
        </div>
      </div>

      {data.negativeHistory && data.negativeHistory.length > 0 && (
        <NoticeBanner
          type="error"
          icon={AlertTriangle}
          title="Atenção: Histórico Negativo na Plataforma"
          description={
            <>
              Este candidato possui {data.negativeHistory.length} registro(s) negativo(s) anteriores:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {data.negativeHistory.map((hist: any, idx: number) => (
                  <li key={idx}>
                    <strong>{hist.status === 'NO_SHOW' ? 'Faltou na Entrevista' : 'Demitido/Desligado'}</strong> na vaga &quot;{hist.job.title}&quot; ({new Date(hist.updatedAt).toLocaleDateString('pt-BR')})
                  </li>
                ))}
              </ul>
            </>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados do Candidato */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User size={20}/> Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <div className="relative w-full h-full">
                      <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                    </div>
                  ) : (
                    <User size={40} className="text-slate-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-slate-300"><Mail size={16} className="text-slate-500"/> {profile.email}</p>
                  <p className="flex items-center gap-2 text-slate-300"><Phone size={16} className="text-slate-500"/> {profile.telefone || 'Não informado'}</p>
                  <p className="flex items-center gap-2 text-slate-300"><MapPin size={16} className="text-slate-500"/> {data.candidate.city ? `${data.candidate.city}, ${data.candidate.state}` : 'Local não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.candidate.profile.about && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><User size={20}/> Sobre o Candidato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{data.candidate.profile.about}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Briefcase size={20}/> Experiência Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              {data.candidate.experiences.length === 0 ? (
                <p className="text-slate-400">Nenhuma experiência cadastrada.</p>
              ) : (
                <div className="space-y-4">
                  {data.candidate.experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-slate-700 pl-4 py-1">
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-sm text-slate-400">{exp.companyName} | {new Date(exp.startDate).toLocaleDateString('pt-BR')} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR') : 'Atual'}</p>
                      <p className="text-sm mt-2 text-slate-300">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BookOpen size={20}/> Formação Acadêmica</CardTitle>
            </CardHeader>
            <CardContent>
              {data.candidate.education.length === 0 ? (
                <p className="text-slate-400">Nenhuma formação cadastrada.</p>
              ) : (
                <div className="space-y-4">
                  {data.candidate.education.map((edu: any) => (
                    <div key={edu.id} className="border-l-2 border-slate-700 pl-4 py-1">
                      <h4 className="font-semibold">{edu.courseName} - {edu.degreeType}</h4>
                      <p className="text-sm text-slate-400">{edu.institution} | {edu.startDate ? new Date(edu.startDate).toLocaleDateString('pt-BR') : 'N/A'} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('pt-BR') : 'Atual'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Idiomas e Cursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Languages size={20}/> Idiomas</CardTitle>
              </CardHeader>
              <CardContent>
                {(!data.candidate.languages || data.candidate.languages.length === 0) ? (
                  <p className="text-slate-400 text-sm">Nenhum idioma cadastrado.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.candidate.languages.map((lang: any) => (
                      <li key={lang.id} className="text-sm flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-300 font-medium">{lang.language}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{lang.proficiency}</span>
                          {lang.certificateUrl && (
                            <a href={`/api/certificates/language/${lang.id}`} className="text-xs text-cyan-400 hover:underline">
                              Certificado
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BookOpen size={20}/> Cursos Extras</CardTitle>
              </CardHeader>
              <CardContent>
                {(!data.candidate.courses || data.candidate.courses.length === 0) ? (
                  <p className="text-slate-400 text-sm">Nenhum curso extra cadastrado.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.candidate.courses.map((course: any) => (
                      <li key={course.id} className="text-sm bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-200 font-medium">{course.name}</p>
                            <p className="text-xs text-slate-500">
                              {course.institution}
                              {course.workload && ` • ${course.workload} horas`}
                            </p>
                          </div>
                          {course.certificateUrl && (
                            <a href={`/api/certificates/course/${course.id}`} className="text-xs text-cyan-400 hover:underline bg-cyan-900/20 px-2 py-1 rounded border border-cyan-800">
                              Certificado
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Competências */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">Competências</CardTitle>
            </CardHeader>
            <CardContent>
              {(!data.candidate.skills || data.candidate.skills.length === 0) ? (
                <p className="text-slate-500 text-sm">Nenhuma competência cadastrada.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.candidate.skills.map((skill: any) => (
                    <div key={skill.id} className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">
                      <span className="font-semibold">{skill.name}</span>
                      {skill.level && <span className="bg-slate-900 px-2 py-0.5 rounded text-xs">{skill.level}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currículo em Anexo */}
          {data.candidate.resumeUrl && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded text-blue-400">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Currículo em Anexo</p>
                  <p className="text-xs text-slate-400">Documento PDF original do candidato</p>
                </div>
              </div>
              <a href={data.candidate.resumeUrl} download target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                <Download size={16} /> Baixar
              </a>
            </div>
          )}
        </div>

        {/* Coluna Direita: Notas Internas e Histórico */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MessageSquare size={20}/> Notas Internas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(!data.internalNotes || data.internalNotes.length === 0) ? (
                  <p className="text-sm text-slate-500">Nenhuma nota adicionada.</p>
                ) : (
                  (data.internalNotes as any[]).map((note, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                      <p className="text-slate-300 mb-2">{note.text}</p>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{note.authorName}</span>
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-4 border-t border-slate-800">
                <Textarea 
                  placeholder="Adicione uma observação visível apenas para a empresa..."
                  className="bg-slate-950 border-slate-800 min-h-[80px] mb-2 text-sm"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={submittingNote} className="w-full" size="sm">
                  Adicionar Nota
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Clock size={20}/> Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-slate-300">Candidatura enviada</p>
                    <p className="text-xs text-slate-500">{new Date(data.appliedAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                {data.history.map((hist: any) => (
                  <div key={hist.id} className="flex gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-slate-500 mt-1.5"></div>
                    <div>
                      <p className="text-slate-300">Status alterado para <span className="font-bold">{hist.newStatus}</span></p>
                      <p className="text-xs text-slate-500">{new Date(hist.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleInterviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicationId={data.id}
        candidateId={data.candidate.id}
        jobId={data.job.id}
        onScheduled={fetchDetails}
      />
    </div>
  )
}
