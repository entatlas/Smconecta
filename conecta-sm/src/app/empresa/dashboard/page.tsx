'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Briefcase, Users, FileText, Calendar, PlusCircle, ArrowRight, Clock, AlertCircle, Eye, CheckCircle2, MoreHorizontal, CheckCircle, ChevronRight, User } from 'lucide-react'
import { getCompanyDashboard } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NoticeBanner } from '@/components/ui/NoticeBanner'

export default function EmpresaDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanyDashboard().then(res => {
      setData(res)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>)}
        </div>
        <div className="h-32 bg-slate-800 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-800 rounded-xl"></div>
          <div className="h-96 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro ao carregar o dashboard</h2>
        <p className="text-muted-foreground">Não foi possível carregar as informações. Tente novamente.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  const { pipeline } = data;
  const pipelineTotal = pipeline.received + pipeline.inReview + pipeline.interview + pipeline.finalists || 1; // prevent div by zero

  const statusMap: Record<string, { label: string; color: string }> = {
    'SENT': { label: 'Recebida', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    'IN_REVIEW': { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    'SHORTLISTED': { label: 'Pré-selecionado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    'INTERVIEW': { label: 'Entrevista', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    'APPROVED': { label: 'Aprovado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    'REJECTED': { label: 'Reprovado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    'WITHDRAWN': { label: 'Desistiu', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 overflow-x-hidden">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Olá, {data.companyName}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gerencie suas vagas e acompanhe seus processos seletivos.</p>
        </div>
        <Link href="/empresa/vagas/nova">
          <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20">
            <PlusCircle size={20} /> Criar nova vaga
          </Button>
        </Link>
      </div>

      {/* 2. Resumo Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vagas Ativas</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.activeJobsCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Candidaturas</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalApplications}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Em Processo</span>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Users className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.inProcessCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Entrevistas</span>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.interviewsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Processo Seletivo (Pipeline) */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
          <CardTitle className="text-lg">Processo Seletivo</CardTitle>
          <CardDescription>Visão geral dos candidatos em cada etapa</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-2 text-sm text-center">
            
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 relative">
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mb-1">{pipeline.received}</span>
              <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Recebidos</span>
              <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 z-10" size={24}/>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 relative">
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mb-1">{pipeline.inReview}</span>
              <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Em Análise</span>
              <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 z-10" size={24}/>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 relative">
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mb-1">{pipeline.interview}</span>
              <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">Entrevista</span>
              <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 z-10" size={24}/>
            </div>

            <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{pipeline.finalists}</span>
              <span className="text-emerald-600 dark:text-emerald-500 font-medium uppercase text-xs tracking-wider">Finalistas</span>
            </div>

          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. Candidaturas Recentes */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Candidaturas Recentes</CardTitle>
            <Link href="/empresa/candidaturas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">Ver todas <ArrowRight size={16}/></Link>
          </CardHeader>
          <CardContent className="flex-1">
            {data.recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Nenhuma candidatura ainda</h3>
                  <p className="text-sm text-muted-foreground mt-1">Candidaturas recentes aparecerão aqui.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentApplications.map((app: any) => {
                  const statusInfo = statusMap[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{app.candidateName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Briefcase size={14}/>
                          <span>{app.jobTitle}</span>
                          <span>•</span>
                          <span title={new Date(app.appliedAt).toLocaleString()}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <Link href={`/empresa/candidaturas/${app.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            <Eye size={14} className="mr-2"/> Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-8 flex flex-col">
          
          {/* 5. Atenção Necessária (Only show if > 0) */}
          {data.attentionNeeded > 0 && (
            <NoticeBanner
              type="warning"
              icon={AlertCircle}
              title="Precisa de atenção"
              description={
                <>
                  Você tem <strong className="font-bold">{data.attentionNeeded} candidaturas</strong> aguardando análise inicial.
                </>
              }
              action={{
                label: 'Ver candidaturas',
                href: '/empresa/candidaturas'
              }}
            />
          )}

          {/* 6. Próximas Entrevistas */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="text-blue-600" size={20}/> Próximas Entrevistas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {data.upcomingInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-6">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Clock className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">Nenhuma entrevista agendada.</h3>
                  </div>
                  <Link href="/empresa/agenda">
                    <Button variant="outline" size="sm" className="mt-2">Abrir Agenda</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.upcomingInterviews.map((interview: any) => {
                    const date = new Date(interview.scheduledAt);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={interview.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg flex-shrink-0 ${isToday ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                          <span className="text-xs font-semibold uppercase">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate" title={interview.candidateName}>{interview.candidateName}</h4>
                          <p className="text-xs text-muted-foreground truncate" title={interview.jobTitle}>{interview.jobTitle}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              <Clock size={10}/> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isToday && <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">HOJE</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 7. Minhas Vagas */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Minhas Vagas</CardTitle>
            <Link href="/empresa/vagas" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">Gerenciar <ArrowRight size={16}/></Link>
          </CardHeader>
          <CardContent>
            {data.myJobsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                <Briefcase className="h-10 w-10 text-slate-400" />
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Você ainda não possui vagas publicadas.</h3>
                  <p className="text-sm text-muted-foreground mt-1">Crie sua primeira vaga para começar a receber candidaturas.</p>
                </div>
                <Link href="/empresa/vagas/nova">
                  <Button variant="default">Criar primeira vaga</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="table-responsive">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">Vaga</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-center">Candidaturas</th>
                      <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.myJobsList.map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate" title={job.title}>
                          {job.title}
                          <div className="text-xs text-muted-foreground font-normal mt-0.5">Criada em {new Date(job.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          {job.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-md">
                              <CheckCircle2 size={12}/> Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-md">
                              Fechada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {job._count.applications}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/empresa/vagas/${job.id}/editar`}>
                            <Button variant="ghost" size="sm" className="h-8">Gerenciar</Button>
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

        {/* 8. Ações Rápidas */}
        <Card className="bg-slate-900 text-white border-slate-800 dark:bg-slate-950 dark:border-slate-900">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Link href="/empresa/vagas/nova" style={{ width: '100%', textDecoration: 'none' }}>
                <Button variant="secondary" className="w-full justify-start text-slate-900 bg-white hover:bg-slate-100">
                  <PlusCircle className="mr-2 h-4 w-4" /> Criar Vaga
                </Button>
              </Link>
              <Link href="/empresa/candidaturas" style={{ width: '100%', textDecoration: 'none' }}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                  <FileText className="mr-2 h-4 w-4" /> Ver candidaturas
                </Button>
              </Link>
              <Link href="/empresa/candidatos" style={{ width: '100%', textDecoration: 'none' }}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                  <Users className="mr-2 h-4 w-4" /> Banco de Talentos
                </Button>
              </Link>
              <Link href="/empresa/agenda" style={{ width: '100%', textDecoration: 'none' }}>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                  <Calendar className="mr-2 h-4 w-4" /> Acessar Agenda
                </Button>
              </Link>
            </div>

            {data.topJob && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">Vaga em Destaque</h4>
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 flex flex-col gap-1">
                  <span className="font-semibold truncate text-sm text-blue-50" title={data.topJob.title}>{data.topJob.title}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users size={14} className="text-blue-400"/>
                    <span className="text-xs text-blue-400 font-bold">{data.topJob._count.applications} candidaturas</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
