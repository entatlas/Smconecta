'use client'

import React, { useState, useEffect } from 'react'
import { getSubscriptionPlans, upsertSubscriptionPlan, deleteSubscriptionPlan } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function PlanosAdminPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    interval: 'MONTHLY',
    isActive: true,
    maxJobs: 1,
    canViewTalents: false
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const data = await getSubscriptionPlans()
      setPlans(data)
    } catch (e: any) {
      toast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan.id)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      interval: plan.interval,
      isActive: plan.isActive,
      maxJobs: plan.features?.maxJobs || 1,
      canViewTalents: !!plan.features?.canViewTalents
    })
  }

  const handleNew = () => {
    setEditingPlan('NEW')
    setFormData({
      name: '',
      description: '',
      price: 0,
      interval: 'MONTHLY',
      isActive: true,
      maxJobs: 1,
      canViewTalents: false
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertSubscriptionPlan({
        id: editingPlan === 'NEW' ? undefined : editingPlan,
        ...formData
      })
      toast.success('Plano salvo com sucesso!')
      setEditingPlan(null)
      loadPlans()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar plano')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este plano?')) return
    try {
      await deleteSubscriptionPlan(id)
      toast.success('Plano excluído.')
      loadPlans()
    } catch (e: any) {
      toast.error('Erro ao excluir plano')
    }
  }

  if (loading) return <div className="p-8 text-white">Carregando...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Planos Premium</h1>
          <p className="text-slate-400">Gerencie os limites e preços das assinaturas.</p>
        </div>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Novo Plano
        </Button>
      </div>

      {editingPlan && (
        <Card className="bg-slate-900 border-slate-800 mb-8 p-6">
          <CardTitle className="text-xl mb-4 text-white">
            {editingPlan === 'NEW' ? 'Criar Novo Plano' : 'Editar Plano'}
          </CardTitle>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do Plano (Ex: Gratuito, Premium)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Preço Mensal (R$)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            
            <Input
              label="Descrição Curta"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="p-4 bg-slate-800 rounded-lg space-y-4 border border-slate-700">
              <h4 className="font-semibold text-blue-400">Limites e Recursos (Gatekeeping)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Limite de Vagas Ativas (Use 999 para Ilimitado)"
                  type="number"
                  value={formData.maxJobs}
                  onChange={e => setFormData({ ...formData, maxJobs: parseInt(e.target.value) })}
                  required
                />
                
                <div className="flex flex-col gap-2 justify-center">
                  <label className="text-sm text-slate-400">Acesso ao Banco de Talentos</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canViewTalents}
                      onChange={e => setFormData({ ...formData, canViewTalents: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600"
                    />
                    <span>Permitir busca e contato ativo com talentos</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex justify-between items-start">
                <span>{plan.name}</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm h-10 mb-4">{plan.description}</p>
              
              <div className="bg-slate-800 p-4 rounded-lg mb-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Vagas Máximas:</span>
                  <strong className="text-blue-400">{plan.features.maxJobs >= 999 ? 'Ilimitado' : plan.features.maxJobs}</strong>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Banco de Talentos:</span>
                  <strong className={plan.features.canViewTalents ? 'text-emerald-400' : 'text-red-400'}>
                    {plan.features.canViewTalents ? 'Liberado' : 'Bloqueado'}
                  </strong>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEdit(plan)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
