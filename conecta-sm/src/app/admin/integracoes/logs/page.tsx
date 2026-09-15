import { prisma } from '@/lib/prisma';
import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function IntegracoesLogsDashboard() {
  const logs = await prisma.integrationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={28} /> Central de Logs
          </h1>
          <p style={{ color: '#94a3b8' }}>Monitoramento de tráfego, webhooks, retries e disparos de email.</p>
        </div>
        
        <Link href="/admin/integracoes" style={{ color: '#00E5FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Voltar para Integrações
        </Link>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Histórico de Processamento</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Data</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Integração</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Evento</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Destino (Protegido)</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '1rem', color: '#fff', fontWeight: 500 }}>
                    {log.integrationType}
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {log.event}
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {log.target ? log.target.replace(/(?<=.).(?=.*@)/g, '*') : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {log.status === 'SUCCESS' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={12}/> Sucesso
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <XCircle size={12}/> Falha
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    Nenhum registro de log encontrado. Secrets são ocultos por padrão.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
