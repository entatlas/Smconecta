'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Eye, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getCompanyApplications } from './actions'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EmpresaCandidaturasPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await getCompanyApplications(1, 50, search, statusFilter)
      setApplications(res.applications)
    } catch (err) {
      toast.error('Erro ao buscar candidaturas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, statusFilter])

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SENT': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Nova</span>
      case 'IN_REVIEW': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Em Análise</span>
      case 'SHORTLISTED': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">Pré-selecionado</span>
      case 'INTERVIEW': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">Entrevista</span>
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Aprovado</span>
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Reprovado</span>
      case 'WITHDRAWN': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">Desistiu</span>
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidaturas</h1>
          <p className="text-muted-foreground">Gerencie quem se candidatou às suas vagas.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            type="text" 
            placeholder="Buscar por nome do candidato..." 
            className="pl-10 bg-slate-950 border-slate-800"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-950 border-slate-800">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as candidaturas</SelectItem>
              <SelectItem value="SENT">Novas</SelectItem>
              <SelectItem value="IN_REVIEW">Em Análise</SelectItem>
              <SelectItem value="SHORTLISTED">Pré-selecionados</SelectItem>
              <SelectItem value="INTERVIEW">Entrevista</SelectItem>
              <SelectItem value="APPROVED">Aprovados</SelectItem>
              <SelectItem value="REJECTED">Reprovados</SelectItem>
              <SelectItem value="WITHDRAWN">Desistiram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground">Carregando candidaturas...</div>
      ) : applications.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Search size={48} className="opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">Nenhuma candidatura encontrada</h3>
            <p className="text-sm text-slate-400">Tente alterar os filtros ou a busca.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <Card key={app.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {app.candidate.profile.avatar_url ? (
                      <div className="relative w-full h-full">
                        <Image src={app.candidate.profile.avatar_url} alt="Avatar" fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-400">{app.candidate.profile.nome.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{app.candidate.profile.nome}</h3>
                    <p className="text-sm text-slate-400">{app.candidate.profile.email}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">{app.job.title}</p>
                  <p className="text-xs text-slate-500">Em {new Date(app.appliedAt).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="w-32 flex justify-center">
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex justify-end ml-4">
                  <Link href={`/empresa/candidaturas/${app.id}`}>
                    <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-lg bg-slate-950 transition-all">
                      <Eye size={16} /> Ver Perfil
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
