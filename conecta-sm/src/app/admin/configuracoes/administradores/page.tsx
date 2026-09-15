import React from 'react';
import { getAdmins } from './actions';
import AdministradoresList from './AdministradoresList';

export default async function AdministradoresPage() {
  const admins = await getAdmins();

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Gestão de Administradores</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Gerencie o acesso da sua equipe interna (Staff).
        </p>
      </div>

      <AdministradoresList initialData={admins} />
    </div>
  );
}
