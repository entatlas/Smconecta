'use client';

import React, { useState } from 'react';
import { saveNotificationSettings } from './actions';

export default function NotificacoesForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setLoading(true);
    await saveNotificationSettings(data);
    setLoading(false);
    alert('Configurações de notificações salvas com sucesso!');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          <div>
            <h3 style={{ margin: 0 }}>Notificações por E-mail</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Envio de e-mails transacionais (boas-vindas, redefinição de senha).</p>
          </div>
          <input 
            type="checkbox" 
            checked={data.emailEnabled} 
            onChange={(e) => setData({ ...data, emailEnabled: e.target.checked })} 
            style={{ transform: 'scale(1.5)', cursor: 'pointer' }} 
          />
        </label>

        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          <div>
            <h3 style={{ margin: 0 }}>Notificações SMS</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Alertas via mensagem de texto (requer integração ativa).</p>
          </div>
          <input 
            type="checkbox" 
            checked={data.smsEnabled} 
            onChange={(e) => setData({ ...data, smsEnabled: e.target.checked })} 
            style={{ transform: 'scale(1.5)', cursor: 'pointer' }} 
          />
        </label>

        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          <div>
            <h3 style={{ margin: 0 }}>Notificações Push (Web)</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Notificações no navegador para usuários logados.</p>
          </div>
          <input 
            type="checkbox" 
            checked={data.pushEnabled} 
            onChange={(e) => setData({ ...data, pushEnabled: e.target.checked })} 
            style={{ transform: 'scale(1.5)', cursor: 'pointer' }} 
          />
        </label>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </>
  );
}
