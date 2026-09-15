'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { getAuditLogs } from './actions'
import { ShieldAlert, User, Activity } from 'lucide-react'

export default function AuditoriaPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs().then(res => {
      setData(res)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8" style={{ color: '#EAF2FF' }}>Carregando auditoria...</div>

  if (!data) return (
    <div className="p-8 text-red-500">
      <ShieldAlert className="w-12 h-12 mb-4" />
      <h1 className="text-2xl font-bold">Acesso Negado ou Erro</h1>
      <p>Você não tem permissão para visualizar o log de auditoria.</p>
    </div>
  )

  return (
    <div className="p-8 space-y-6" style={{ color: '#EAF2FF', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Logs de Auditoria e Segurança</h1>
        <ShieldAlert className="h-6 w-6 text-cyan-400" />
      </div>

      <Card style={{ padding: '1.5rem', backgroundColor: '#031225', border: '1px solid #11284A' }}>
        <div style={{ borderBottom: '1px solid #11284A', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 className="font-bold text-lg">Histórico Recente (Últimas 50 ações)</h3>
        </div>
        <div>
          <div className="space-y-4">
            {data.logs.map((log: any) => (
              <div key={log.id} className="p-4 border rounded-lg bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 flex-shrink-0" /> 
                      <span className="font-semibold">{log.profile?.nome || 'Sistema'}</span> 
                    </div>
                    <span className="text-muted-foreground break-all text-xs sm:text-sm">({log.profile?.email || 'N/A'})</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="font-bold text-sm text-blue-600 uppercase break-all">{log.action}</span>
                  <span className="text-sm">em <b>{log.entityType}</b> {log.entityId ? `(#${log.entityId.substring(0,8)})` : ''}</span>
                </div>

                <div className="text-xs space-y-1">
                  <p><b>IP:</b> {log.ipAddress || 'N/A'}</p>
                  <p><b>ReqID:</b> {log.requestId || 'N/A'}</p>
                </div>
              </div>
            ))}
            
            {data.logs.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum log de auditoria encontrado.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
