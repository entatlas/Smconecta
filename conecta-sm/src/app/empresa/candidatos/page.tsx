'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Search, User, Mail, Phone, ExternalLink } from 'lucide-react'
import { getCompanyCandidates, updateApplicationStatus } from './actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Download, MapPin, Briefcase, GraduationCap, Languages, BookOpen } from 'lucide-react'
import { SkeletonTable } from '@/components/ui/Loading/SkeletonTable'
import Image from 'next/image'

export default function EmpresaCandidatosPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const { t } = useTranslation()

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const res = await getCompanyCandidates(1, 20, search)
      setCandidates(res.candidates)
    } catch (err) {
      toast.error(t('candidates.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(appId, newStatus)
      toast.success(t('crm.movedSuccess'))
      setCandidates(candidates.map(c => c.applicationId === appId ? { ...c, status: newStatus } : c))
    } catch (err) {
      toast.error(t('crm.movedError'))
    }
  }

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'Especialista':
        return { bg: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)', text: '#FFF', border: '1px solid #26D0CE', icon: '💎' };
      case 'Avançado':
        return { bg: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', text: '#FFF', border: '1px solid #ED8F03', icon: '🥇' };
      case 'Intermediário':
        return { bg: 'linear-gradient(135deg, #E2E2E2 0%, #999999 100%)', text: '#333', border: '1px solid #999999', icon: '🥈' };
      case 'Básico':
      default:
        return { bg: 'linear-gradient(135deg, #e55d87 0%, #5fc3e4 100%)', text: '#FFF', border: '1px solid #e55d87', icon: '🥉' };
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCandidates()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('candidates.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('candidates.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('candidates.searchPlaceholder')} 
              className="w-full pl-9 pr-4 py-2 border rounded-md"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-4">
              <SkeletonTable rows={4} columns={5} />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
              <User className="mx-auto h-12 w-12 text-slate-600 mb-2" />
              <h3 className="text-lg font-medium text-slate-200 mb-1">{t('candidates.emptyTitle')}</h3>
              <p className="text-slate-400 mb-4 text-sm">{t('candidates.emptyDesc')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="table-responsive">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('candidates.table.candidate')}</th>
                    <th className="px-4 py-3 font-medium">{t('candidates.table.contact')}</th>
                    <th className="px-4 py-3 font-medium">{t('candidates.table.appliedJob')}</th>
                    <th className="px-4 py-3 font-medium">{t('candidates.table.status')}</th>
                    <th className="px-4 py-3 font-medium text-right">{t('candidates.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {candidates.map(cand => (
                    <tr key={cand.applicationId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-100">{cand.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail size={12}/> {cand.email}</span>
                          {cand.phone && <span className="flex items-center gap-1"><Phone size={12}/> {cand.phone}</span>}
                          {cand.resumeUrl && (
                            <a href={cand.resumeUrl} download className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-1">
                              <FileText size={12}/> Baixar Currículo
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-blue-400">{cand.jobTitle}</td>
                      <td className="px-4 py-4">
                        <Select value={cand.status} onValueChange={(val) => handleStatusChange(cand.applicationId, val)}>
                          <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SENT">{t('status.sent')}</SelectItem>
                            <SelectItem value="IN_REVIEW">{t('status.in_review')}</SelectItem>
                            <SelectItem value="SHORTLISTED">{t('status.shortlisted')}</SelectItem>
                            <SelectItem value="INTERVIEW">{t('status.interview')}</SelectItem>
                            <SelectItem value="APPROVED">{t('status.approved')}</SelectItem>
                            <SelectItem value="REJECTED">{t('status.rejected')}</SelectItem>
                            <SelectItem value="WITHDRAWN">{t('status.withdrawn')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-slate-400 hover:text-slate-300 mr-3" title="Ver Perfil Completo">
                              <Eye size={18} className="inline" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl flex items-center gap-3">
                                {cand.avatarUrl ? (
                                  <div className="relative w-10 h-10">
                                    <Image src={cand.avatarUrl} alt={cand.name} fill className="rounded-full object-cover" />
                                  </div>
                                ) : (
                                  <User className="text-blue-400 w-8 h-8" />
                                )}
                                <div>
                                  <span>{cand.name}</span>
                                  {cand.headline && <p className="text-sm text-slate-400 font-normal">{cand.headline}</p>}
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-8">
                              {/* Info Básica */}
                              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                <div>
                                  <p className="text-slate-400 mb-1 flex items-center gap-1"><Mail size={14}/> Email</p>
                                  <p>{cand.email}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 mb-1 flex items-center gap-1"><Phone size={14}/> Telefone</p>
                                  <p>{cand.phone || 'Não informado'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 mb-1 flex items-center gap-1"><MapPin size={14}/> Localização</p>
                                  <p>{[cand.city, cand.state].filter(Boolean).join(' - ') || 'Não informado'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 mb-1 flex items-center gap-1"><Briefcase size={14}/> Vaga de Interesse</p>
                                  <p className="text-blue-400 font-medium">{cand.jobTitle}</p>
                                </div>
                              </div>

                              {/* Sobre */}
                              {cand.about && (
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2">Sobre</h4>
                                  <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">{cand.about}</p>
                                </div>
                              )}

                              {/* Experiência */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2"><Briefcase size={16}/> Experiência Profissional</h4>
                                {(!cand.experiences || cand.experiences.length === 0) ? (
                                  <p className="text-slate-500 text-sm">Nenhuma experiência cadastrada.</p>
                                ) : (
                                  <div className="space-y-4">
                                    {cand.experiences.map((exp: any) => (
                                      <div key={exp.id} className="border-l-2 border-slate-700 pl-4 py-1">
                                        <h5 className="font-medium text-slate-200">{exp.role}</h5>
                                        <p className="text-blue-400 text-sm">{exp.company}</p>
                                        <p className="text-slate-500 text-xs mb-2">
                                          {new Date(exp.startDate).toLocaleDateString('pt-BR')} - {exp.isCurrent ? 'Atual' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR') : '')}
                                        </p>
                                        {exp.activities && <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{exp.activities}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Educação */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2"><GraduationCap size={16}/> Formação Acadêmica</h4>
                                {(!cand.education || cand.education.length === 0) ? (
                                  <p className="text-slate-500 text-sm">Nenhuma formação cadastrada.</p>
                                ) : (
                                  <div className="space-y-4">
                                    {cand.education.map((edu: any) => (
                                      <div key={edu.id}>
                                        <h5 className="font-medium text-slate-200">{edu.course} <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-2">{edu.level}</span></h5>
                                        <p className="text-slate-400 text-sm">{edu.institution}</p>
                                        <p className="text-slate-500 text-xs">Conclusão: {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Cursando'}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Idiomas e Cursos */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2"><Languages size={16}/> Idiomas</h4>
                                  {(!cand.languages || cand.languages.length === 0) ? (
                                    <p className="text-slate-500 text-sm">Nenhum idioma cadastrado.</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {cand.languages.map((lang: any) => (
                                        <li key={lang.id} className="text-sm flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                                          <span className="text-slate-300 font-medium">{lang.language}</span>
                                          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{lang.speaking}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2"><BookOpen size={16}/> Cursos Extras</h4>
                                  {(!cand.courses || cand.courses.length === 0) ? (
                                    <p className="text-slate-500 text-sm">Nenhum curso extra cadastrado.</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {cand.courses.map((course: any) => (
                                        <li key={course.id} className="text-sm bg-slate-950 p-2 rounded border border-slate-800">
                                          <p className="text-slate-200 font-medium">{course.name}</p>
                                          <p className="text-xs text-slate-500">{course.institution}</p>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {/* Competências */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2">Competências</h4>
                                {(!cand.skills || cand.skills.length === 0) ? (
                                  <p className="text-slate-500 text-sm">Nenhuma competência cadastrada.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {cand.skills.map((skill: any) => {
                                      const style = getBadgeStyle(skill.level || 'Básico');
                                      return (
                                        <div key={skill.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: style.bg, color: style.text, border: style.border, padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                          <span style={{ fontSize: '0.85rem' }}>{style.icon}</span>
                                          <span style={{ fontWeight: 600 }}>{skill.name}</span>
                                          <span style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem' }}>{skill.level}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Currículo */}
                              {cand.resumeUrl && (
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between mt-6">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/10 p-2 rounded text-blue-400">
                                      <FileText size={24} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-200">Currículo em Anexo</p>
                                      <p className="text-xs text-slate-400">Documento PDF original do candidato</p>
                                    </div>
                                  </div>
                                  <a href={cand.resumeUrl} download target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                                    <Download size={16} /> Baixar
                                  </a>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Link href={`/empresa/crm`} className="text-blue-500 hover:text-blue-400" title={t('candidates.viewCrm')}>
                          <ExternalLink size={18} className="inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
