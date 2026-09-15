'use client';

import React, { useState } from 'react';
import { saveSecuritySettings } from './actions';

export default function SecurityForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setLoading(true);
    await saveSecuritySettings(data);
    setLoading(false);
    alert('Configurações de segurança salvas com sucesso!');
  };

  return (
    <>
      <div style={{ background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
        <h3>Autenticação de Dois Fatores (2FA)</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Exija 2FA para todos os administradores.</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={data.require2FA} 
            onChange={(e) => setData({ ...data, require2FA: e.target.checked })} 
            style={{ transform: 'scale(1.2)' }}
          />
          Ativar 2FA Global
        </label>
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
        <h3>Política de Senhas</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Defina a complexidade mínima para senhas de usuários.</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={data.requireUppercase} 
              onChange={(e) => setData({ ...data, requireUppercase: e.target.checked })} 
            /> 
            Exigir letras maiúsculas e minúsculas
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={data.requireNumbers} 
              onChange={(e) => setData({ ...data, requireNumbers: e.target.checked })} 
            /> 
            Exigir números
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={data.requireSpecialChars} 
              onChange={(e) => setData({ ...data, requireSpecialChars: e.target.checked })} 
            /> 
            Exigir caracteres especiais
          </label>
        </div>
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
