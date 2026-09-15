'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, Power, Users, DollarSign, AlertCircle } from 'lucide-react';
import { togglePlanStatus, deletePlan, upsertSubscriptionPlan, upsertCommercialService, deleteCommercialService } from './actions';
import { toast } from 'sonner';

export default function AdminAssinaturasClient({
  subscriptions,
  plans,
  services,
  mrr,
  activeCount,
  canceledCount
}: {
  subscriptions: any[];
  plans: any[];
  services: any[];
  mrr: number;
  activeCount: number;
  canceledCount: number;
}) {
  return (
    <div className="space-y-8">
      {/* HEADER & MÉTRICAS */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Assinaturas e Serviços</h1>
          <p className="text-slate-500">Acompanhe o faturamento, planos, serviços avulsos e status de usuários.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">MRR (Mensal)</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {mrr.toFixed(2).replace('.', ',')}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Assinantes Ativos</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Cancelamentos (Churn)</p>
              <h3 className="text-2xl font-bold text-slate-900">{canceledCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ASSINATURAS ATIVAS */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Assinaturas Recentes</CardTitle>
            <CardDescription>Lista dos últimos clientes assinantes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {subscriptions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhuma assinatura registrada ainda.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-slate-500 font-medium">Cliente</th>
                    <th className="py-3 px-4 text-slate-500 font-medium">Plano</th>
                    <th className="py-3 px-4 text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {sub.candidate?.profile?.nome || sub.company?.tradeName || 'Desconhecido'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{sub.plan.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          sub.status === 'CANCELED' ? 'bg-red-50 text-red-600 border-red-200' : 
                          'bg-yellow-50 text-yellow-600 border-yellow-200'
                        }>
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8 flex flex-col">
          {/* GERENCIAR PLANOS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planos Configurados</CardTitle>
                <CardDescription>Gerencie os planos visíveis no site.</CardDescription>
              </div>
              <Button size="sm" onClick={() => toast.info('Adicionar plano abriria modal de form aqui (MVP)')}>
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <p className="text-slate-500">Nenhum plano configurado no banco.</p>
              ) : (
                <div className="space-y-3">
                  {plans.map(plan => (
                    <div key={plan.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${plan.isActive ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {plan.name}
                          {!plan.isActive && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                        </h4>
                        <p className="text-sm text-slate-500">R$ {plan.price.toFixed(2)} / {plan.interval === 'MONTHLY' ? 'Mês' : 'Ano'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          togglePlanStatus(plan.id, plan.isActive);
                          toast.success('Status do plano alterado!');
                        }} title={plan.isActive ? "Desativar" : "Ativar"}>
                          <Power className={`w-4 h-4 ${plan.isActive ? 'text-slate-400 hover:text-red-500' : 'text-emerald-500'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toast.info('Modal Editar Plano')} title="Editar">
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          deletePlan(plan.id);
                          toast.success('Plano deletado!');
                        }} title="Excluir">
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GERENCIAR SERVIÇOS AVULSOS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Serviços Avulsos</CardTitle>
                <CardDescription>Revisão de Currículo, Hunting, Vagas Patrocinadas, etc.</CardDescription>
              </div>
              <Button size="sm" onClick={() => toast.info('Adicionar serviço abriria modal de form aqui (MVP)')}>
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-slate-500">Nenhum serviço avulso configurado no banco.</p>
              ) : (
                <div className="space-y-3">
                  {services.map(service => (
                    <div key={service.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${service.status === 'ACTIVE' ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {service.name}
                          {service.status !== 'ACTIVE' && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                        </h4>
                        <p className="text-sm text-slate-500">{service.price ? `R$ ${service.price.toFixed(2)}` : 'Consulte Condições'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toast.info('Modal Editar Serviço')} title="Editar">
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          deleteCommercialService(service.id);
                          toast.success('Serviço deletado!');
                        }} title="Excluir">
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
