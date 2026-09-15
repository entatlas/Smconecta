'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCompanyJob, updateCompanyJob } from '../../actions'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EditarVagaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    modality: 'PRESENCIAL',
    hiringType: 'CLT'
  })

  useEffect(() => {
    params.then(p => {
      setJobId(p.id)
      fetchJob(p.id)
    })
  }, [params])

  const fetchJob = async (id: string) => {
    try {
      const job = await getCompanyJob(id)
      
      // Parse description and requirements if they are joined
      let desc = job.description || ''
      let reqs = ''
      if (desc.includes('\n\n**Requisitos:**\n')) {
        const parts = desc.split('\n\n**Requisitos:**\n')
        desc = parts[0]
        reqs = parts[1]
      }

      setFormData({
        title: job.title,
        description: desc,
        requirements: reqs,
        location: job.city || '',
        modality: job.modality || 'PRESENCIAL',
        hiringType: job.employmentType || 'CLT'
      })
    } catch (err) {
      toast.error('Erro ao carregar vaga')
      router.push('/empresa/vagas')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Título e Descrição são obrigatórios.')
      return
    }
    if (!jobId) return

    setLoading(true)
    try {
      await updateCompanyJob(jobId, formData)
      toast.success('Vaga atualizada com sucesso!')
      router.push('/empresa/vagas')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar vaga.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-12 text-center text-slate-400">Carregando dados da vaga...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Vaga</h1>
        <Link href="/empresa/vagas" className="text-muted-foreground hover:underline">
          Voltar
        </Link>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Informações Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título da Vaga *</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800" 
              placeholder="Ex: Analista Financeiro Pleno"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Modalidade</label>
              <select 
                className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800"
                value={formData.modality}
                onChange={e => setFormData({ ...formData, modality: e.target.value })}
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="HIBRIDO">Híbrido</option>
                <option value="REMOTO">Remoto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Contratação</label>
              <select 
                className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800"
                value={formData.hiringType}
                onChange={e => setFormData({ ...formData, hiringType: e.target.value })}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="ESTAGIO">Estágio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Localização (Cidade/Estado)</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800" 
              placeholder="Ex: São Paulo, SP"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição da Vaga *</label>
            <textarea 
              rows={4}
              className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800" 
              placeholder="Descreva as responsabilidades, o dia a dia, etc."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Requisitos (Opcional)</label>
            <textarea 
              rows={3}
              className="w-full border rounded-md px-3 py-2 bg-slate-950 border-slate-800" 
              placeholder="O que o candidato precisa ter?"
              value={formData.requirements}
              onChange={e => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/empresa/vagas">
          <button 
            disabled={loading}
            className="px-6 py-2 border border-slate-700 rounded-lg hover:bg-slate-800 font-medium"
          >
            Cancelar
          </button>
        </Link>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          {loading ? 'Processando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
