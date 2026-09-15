'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { saveAppearanceSettings } from './actions';

export default function AparenciaForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setLoading(true);
    await saveAppearanceSettings(data);
    setLoading(false);
    alert('Configurações de aparência salvas com sucesso!');
  };

  return (
    <>
      <div style={{ background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
        <h3>Logotipo da Empresa</h3>
        <div style={{ marginTop: '1rem', padding: '2rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          {data.logoUrl ? (
            <div style={{ marginBottom: '1rem', position: 'relative', height: '60px', width: '100%' }}>
              <Image src={data.logoUrl} alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Arraste uma imagem ou clique para fazer upload (URL simulada)</p>
          )}
          <input 
            type="text" 
            placeholder="URL da Imagem..." 
            value={data.logoUrl} 
            onChange={(e) => setData({ ...data, logoUrl: e.target.value })}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: '#fff', width: '80%', marginBottom: '1rem' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
        <h3>Tema e Cores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Cor Primária</label>
            <input 
              type="color" 
              value={data.primaryColor} 
              onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
              style={{ width: '100%', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Modo de Cor Padrão</label>
            <select 
              value={data.colorMode}
              onChange={(e) => setData({ ...data, colorMode: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              <option>Escuro (Padrão)</option>
              <option>Claro</option>
              <option>Seguir sistema</option>
            </select>
          </div>
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
