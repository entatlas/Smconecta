'use client';

import React from 'react';
import { Settings, Mail, Bell, Smartphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationPreferencesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/notificacoes" style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>Preferências de Comunicação</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Gerencie como o Conecta SM entra em contato com você.</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <Bell size={24} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Notificações no Sistema</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Alertas de candidaturas e entrevistas diretamente no painel.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ transform: 'scale(1.5)' }} />
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <Mail size={24} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Emails Transacionais</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Confirmações e lembretes enviados para seu email de cadastro.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ transform: 'scale(1.5)' }} />
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <Smartphone size={24} color="#94a3b8" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Push e SMS</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Indisponível no momento.</p>
            </div>
          </div>
          <input type="checkbox" disabled style={{ transform: 'scale(1.5)' }} />
        </div>
      </div>
      
      <button style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
        Salvar Preferências
      </button>
    </div>
  );
}
