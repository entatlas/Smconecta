'use client';

import React, { useState } from 'react';
import { revokeAdmin } from './actions';
import { Users, Trash2 } from 'lucide-react';

export default function AdministradoresList({ initialData }: { initialData: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste administrador?')) return;
    
    setLoadingId(id);
    await revokeAdmin(id);
    setLoadingId(null);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert("Em breve: Modal de cadastro de novo admin")}>
          <Users size={18} /> Novo Administrador
        </button>
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Nome</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>E-mail</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Nenhum administrador encontrado além de você.
                </td>
              </tr>
            ) : (
              initialData.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>{admin.nome}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{admin.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.8rem', 
                      background: admin.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)',
                      color: '#fff'
                    }}>
                      {admin.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRevoke(admin.id)}
                      disabled={loadingId === admin.id}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', opacity: loadingId === admin.id ? 0.5 : 1 }}
                      title="Revogar Acesso"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
