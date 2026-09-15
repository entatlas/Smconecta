import React from 'react';
import { getSecuritySettings } from './actions';
import SecurityForm from './SecurityForm';

export default async function SegurancaPage() {
  const initialData = await getSecuritySettings();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Sistema e Segurança</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Gerenciamento de permissões, políticas de senha e autenticação de dois fatores.
      </p>

      <SecurityForm initialData={initialData} />
    </div>
  );
}
