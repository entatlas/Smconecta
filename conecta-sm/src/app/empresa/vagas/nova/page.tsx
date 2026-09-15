'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCompanyJob } from '../actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAsyncAction } from '@/hooks/useAsyncAction'

export default function NovaVagaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    modality: 'PRESENCIAL',
    hiringType: 'CLT',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    salaryVisibility: true
  })

  const { execute: handleSubmit, isLoading: loading } = useAsyncAction(
    async (status: 'DRAFT' | 'PUBLISHED') => {
      if (!formData.title || !formData.description) {
        toast.error('Título e Descrição são obrigatórios.')
        throw new Error('Validação falhou')
      }
      await createCompanyJob({ ...formData, status })
      return status;
    },
    {
      onSuccess: (status) => {
        toast.success(status === 'PUBLISHED' ? 'Vaga publicada com sucesso!' : 'Rascunho salvo!')
        router.push('/empresa/vagas')
      },
      onError: (err) => {
        if (err.message !== 'Validação falhou') {
          toast.error(err.message || 'Erro ao criar vaga.')
        }
      }
    }
  )

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Criar Nova Vaga</h1>
        <Link href="/empresa/vagas" className="text-muted-foreground hover:underline">
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título da Vaga *</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Ex: Analista Financeiro Pleno"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Modalidade</label>
              <select 
                className="w-full border rounded-md px-3 py-2"
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
                className="w-full border rounded-md px-3 py-2"
                value={formData.hiringType}
                onChange={e => setFormData({ ...formData, hiringType: e.target.value })}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="ESTAGIO">Estágio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nível de Experiência</label>
              <select 
                className="w-full border rounded-md px-3 py-2 bg-slate-900 border-slate-800 text-slate-100"
                value={formData.experienceLevel}
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                <option value="">Não especificado</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
                <option value="Estagiário">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibilidade do Salário</label>
              <div className="flex items-center h-[42px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 bg-slate-900 border-slate-800"
                    checked={formData.salaryVisibility}
                    onChange={e => setFormData({ ...formData, salaryVisibility: e.target.checked })}
                  />
                  <span className="text-sm">Mostrar salário para os candidatos</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Salário Mínimo (R$)</label>
              <input 
                type="number" 
                className="w-full border rounded-md px-3 py-2 bg-slate-900 border-slate-800 text-slate-100" 
                placeholder="Ex: 3000"
                value={formData.salaryMin}
                onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Salário Máximo (R$)</label>
              <input 
                type="number" 
                className="w-full border rounded-md px-3 py-2 bg-slate-900 border-slate-800 text-slate-100" 
                placeholder="Ex: 5000"
                value={formData.salaryMax}
                onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Localização (Cidade/Estado)</label>
            <input 
              type="text" 
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Ex: São Paulo, SP"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição da Vaga *</label>
            <textarea 
              rows={4}
              className="w-full border rounded-md px-3 py-2" 
              placeholder="Descreva as responsabilidades, o dia a dia, etc."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Requisitos (Opcional)</label>
            <textarea 
              rows={3}
              className="w-full border rounded-md px-3 py-2" 
              placeholder="O que o candidato precisa ter?"
              value={formData.requirements}
              onChange={e => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <button 
          onClick={() => handleSubmit('DRAFT')}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Salvar como Rascunho
        </button>
        <button 
          onClick={() => handleSubmit('PUBLISHED')}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          {loading ? 'Processando...' : 'Publicar Vaga'}
        </button>
      </div>
    </div>
  )
}
