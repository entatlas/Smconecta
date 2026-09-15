import React from 'react';
import { getAppearanceSettings } from './actions';
import AparenciaForm from './AparenciaForm';

export default async function AparenciaPage() {
  const initialData = await getAppearanceSettings();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Aparência Global</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Personalize a identidade visual do painel administrativo.
      </p>

      <AparenciaForm initialData={initialData} />
    </div>
  );
}
