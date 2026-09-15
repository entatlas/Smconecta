'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Activity, Database, Server, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { getMonitoringData } from './actions'

export default function MonitoramentoPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMonitoringData().then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => {
      // Falha drástica ao tentar pegar os dados
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>Carregando métricas de sistema...</div>
  }

  if (!data) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-primary)' }}>
        <AlertTriangle size={48} color="var(--color-error)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Erro ao carregar monitoramento</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Verifique as permissões ou logs do servidor.</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle size={24} color="var(--color-success)" />
    if (status === 'warning') return <AlertTriangle size={24} color="var(--color-warning)" />
    return <XCircle size={24} color="var(--color-error)" />
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Monitoramento e Saúde do Sistema</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Status Geral: {getStatusIcon(data.systemStatus)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>Banco de Dados</h3>
            <Database size={16} color="var(--color-text-muted)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusIcon(data.database.status)}
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                {data.database.status === 'ok' ? 'Operacional' : 'Forte Degradação'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Latência: {data.database.latency}ms</p>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>API Central</h3>
            <Server size={16} color="var(--color-text-muted)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusIcon(data.api.status)}
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Operacional</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>Webhooks (Eventos)</h3>
            <Activity size={16} color="var(--color-text-muted)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>{data.webhooks.delivered} Entregues</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 600 }}>{data.webhooks.pending} Pendentes</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 600 }}>{data.webhooks.failed} Falhas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {data.webhooks.recentErrors?.length > 0 && (
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Últimos Erros (Webhooks)</h3>
          </div>
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0, listStyle: 'none' }}>
              {data.webhooks.recentErrors.map((err: any) => (
                <li key={err.id} style={{ fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-error)' }}>Erro {err.responseCode || 'S/N'}:</span> {err.event} ({(new Date(err.createdAt)).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  )
}
