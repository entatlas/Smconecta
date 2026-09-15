import { prisma } from '@/lib/prisma';
import React from 'react';
import { Mail, Calendar, MessageSquare, Bot, Webhook, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function IntegracoesDashboard() {
  const integrations = await prisma.integration.findMany();
  
  // Criar integrações padrão no banco caso não existam, apenas para exibição
  const defaultIntegrations = [
    { type: 'EMAIL', name: 'Servidor SMTP / Email Transacional', icon: Mail },
    { type: 'WHATSAPP', name: 'Integração Oficial WhatsApp', icon: MessageSquare },
    { type: 'CALENDAR', name: 'Sincronização de Calendário', icon: Calendar },
    { type: 'AI', name: 'Assistente Inteligência Artificial', icon: Bot },
    { type: 'WEBHOOK', name: 'Webhooks (Eventos de Saída)', icon: Webhook },
  ];

  const getStatusBadge = (type: string) => {
    const integration = integrations.find(i => i.type === type);
    const status = integration?.status || 'INACTIVE';
    
    if (status === 'ACTIVE') return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={12}/> Ativa</span>;
    if (status === 'ERROR') return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12}/> Erro</span>;
    
    return <span style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Não Configurada</span>;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Central de Integrações</h1>
          <p style={{ color: '#94a3b8' }}>Gerencie as conexões do Conecta SM com serviços externos de forma segura.</p>
        </div>
        
        <Link href="/admin/integracoes/logs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem', borderRadius: '8px', textDecoration: 'none' }}>
          <Activity size={18} /> Logs de Eventos
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {defaultIntegrations.map((Integration, idx) => {
          const Icon = Integration.icon;
          return (
            <div key={idx} style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Icon size={24} color="#00E5FF" />
                </div>
                {getStatusBadge(Integration.type)}
              </div>
              
              <div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{Integration.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                  Permite o sistema enviar e receber dados através deste canal garantindo idempotência e segurança.
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Configuração via Variáveis Seguras</span>
                <button style={{ background: 'transparent', border: '1px solid var(--color-border)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Configurar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
