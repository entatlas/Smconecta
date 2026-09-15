'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Search, Edit, PauseCircle, PlayCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { getCompanyJobs, updateJobStatus } from './actions'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/I18nContext'

export default function EmpresaVagasPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { t } = useTranslation()

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await getCompanyJobs(1, 50, search, statusFilter)
      setJobs(res.jobs)
    } catch (err) {
      toast.error(t('jobs.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, statusFilter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'CLOSED' && !confirm(t('jobs.statusConfirm'))) return
    
    try {
      await updateJobStatus(id, newStatus)
      toast.success(`${t('jobs.statusChanged')} ${newStatus}`)
      fetchJobs()
    } catch (err) {
      toast.error(t('jobs.statusError'))
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PUBLISHED': 
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]">{t('jobs.status.published')}</span>
      case 'DRAFT': 
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">{t('jobs.status.draft')}</span>
      case 'PAUSED': 
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_0_10px_rgba(245,158,11,0.1)]">{t('jobs.status.paused')}</span>
      case 'CLOSED': 
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_0_10px_rgba(225,29,72,0.1)]">{t('jobs.status.closed')}</span>
      default: 
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {t('jobs.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t('jobs.subtitle')}</p>
        </div>
        <Link 
          href="/empresa/vagas/nova" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5"
        >
          <PlusCircle size={18} /> {t('jobs.newJobBtn')}
        </Link>
      </div>

      <Card className="bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          
          {/* FILTERS BAR */}
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('jobs.searchPlaceholder')} 
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 w-full md:w-56 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{t('jobs.filterAll')}</option>
                <option value="PUBLISHED">{t('jobs.status.published')}</option>
                <option value="DRAFT">{t('jobs.status.draft')}</option>
                <option value="PAUSED">{t('jobs.status.paused')}</option>
                <option value="CLOSED">{t('jobs.status.closed')}</option>
              </select>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-slate-400 font-medium">{t('jobs.loading')}</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 px-6 mx-6 my-6 border-2 border-dashed border-slate-800/60 rounded-xl bg-slate-900/20">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('jobs.emptyTitle')}</h3>
                <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto">{t('jobs.emptyDesc')}</p>
                <Link href="/empresa/vagas/nova" className="inline-flex bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-lg font-medium transition-colors">
                  {t('jobs.createFirstBtn')}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t('jobs.table.title')}</th>
                      <th className="px-6 py-4 font-semibold">{t('jobs.table.status')}</th>
                      <th className="px-6 py-4 font-semibold">{t('jobs.table.apps')}</th>
                      <th className="px-6 py-4 font-semibold">{t('jobs.table.date')}</th>
                      <th className="px-6 py-4 font-semibold text-right">{t('jobs.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-5">
                          <Link href={`/empresa/vagas/${job.id}/editar`} className="font-semibold text-slate-200 hover:text-blue-400 transition-colors">
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-6 py-5">{getStatusBadge(job.status)}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold px-2.5 py-0.5 rounded-full min-w-[2rem]">
                            {job._count.applications}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-400">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {job.status === 'DRAFT' && (
                              <button onClick={() => handleStatusChange(job.id, 'PUBLISHED')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Publicar">
                                <PlayCircle size={18} />
                              </button>
                            )}
                            {job.status === 'PUBLISHED' && (
                              <button onClick={() => handleStatusChange(job.id, 'PAUSED')} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors" title="Pausar">
                                <PauseCircle size={18} />
                              </button>
                            )}
                            {job.status === 'PAUSED' && (
                              <button onClick={() => handleStatusChange(job.id, 'PUBLISHED')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Retomar">
                                <PlayCircle size={18} />
                              </button>
                            )}
                            {job.status !== 'CLOSED' && (
                              <button onClick={() => handleStatusChange(job.id, 'CLOSED')} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors" title="Encerrar">
                                <XCircle size={18} />
                              </button>
                            )}
                            <div className="w-px h-6 bg-slate-800 mx-1"></div>
                            <Link href={`/empresa/vagas/${job.id}/editar`} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="Editar">
                              <Edit size={18} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
