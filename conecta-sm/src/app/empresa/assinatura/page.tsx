'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Check, Zap, Building, Crown, AlertTriangle, Users } from 'lucide-react'
import { createMercadoPagoCheckout, getCurrentPlan, cancelSubscription, getAvailablePlans } from './actions'
import { toast } from 'sonner'

export default function EmpresaAssinaturaPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('plan_free')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    getCurrentPlan().then(plan => {
      if (plan) setCurrentPlan(plan)
    })
    getAvailablePlans().then(setPlans)
  }, [])

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    try {
      const url = await createMercadoPagoCheckout(planId)
      if (url) {
        if (url.includes('success_mock')) {
          toast.success('Simulação: Pagamento Aprovado com Sucesso! Sua assinatura agora está ativa no banco de dados.')
          setCurrentPlan(planId)
        } else {
          window.location.href = url
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar assinatura')
    } finally {
      setLoading(null)
    }
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const confirmCancel = async () => {
    setShowCancelDialog(false)
    setLoading('cancel')
    try {
      await cancelSubscription()
      toast.success('Assinatura cancelada com sucesso.')
      setCurrentPlan('plan_free')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar assinatura')
    } finally {
      setLoading(null)
    }
  }

  // dynamic plans mapped below

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-100 mb-4 tracking-tight">Planos e Assinaturas</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Encontre os melhores talentos para sua empresa sem limites. Escolha o plano que mais se adapta ao seu momento.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden bg-slate-900 border ${currentPlan === plan.id ? 'border-blue-500 shadow-2xl shadow-blue-900/20' : 'border-slate-800'} rounded-2xl`}
          >
            {currentPlan === plan.id && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Seu Plano Atual
              </div>
            )}
            
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-6">
                <Crown className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-slate-100">{plan.name}</h3>
                <p className="text-slate-400 mt-2 h-10">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-slate-500 ml-2">/{plan.interval === 'YEARLY' ? 'ano' : 'mês'}</span>}
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start text-slate-300">
                  <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                  <span>Limite de {plan.features?.maxJobs >= 999 ? 'Vagas Ilimitadas' : `${plan.features?.maxJobs} Vagas Ativas`}</span>
                </li>
                {plan.features?.canViewTalents && (
                  <li className="flex items-start text-slate-300">
                    <Check className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                    <span>Acesso ao Banco de Talentos</span>
                  </li>
                )}
              </ul>
              
              <button
                onClick={() => {
                  if (plan.price === 0 && currentPlan !== plan.id) {
                    handleCancelClick()
                  } else if (currentPlan !== plan.id) {
                    handleSubscribe(plan.id)
                  }
                }}
                disabled={currentPlan === plan.id || loading === plan.id || loading === 'cancel'}
                className={`w-full py-4 rounded-xl text-center transition-all ${currentPlan === plan.id ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} flex justify-center items-center`}
              >
                {loading === plan.id || (loading === 'cancel' && plan.price === 0) ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  currentPlan === plan.id ? 'Ativo' : (plan.price === 0 ? 'Mudar para Grátis' : 'Assinar Plano')
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 text-xl">
              <AlertTriangle className="h-6 w-6" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-3 text-base">
              Você tem certeza que deseja cancelar sua assinatura?
              <br /><br />
              Você perderá acesso imediato aos recursos premium do plano atual, incluindo vagas ilimitadas e testes de competência.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              onClick={() => setShowCancelDialog(false)}
            >
              Manter Assinatura
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors font-medium"
              onClick={confirmCancel}
            >
              Sim, quero cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
