import React from 'react';
import { getNotificationSettings } from './actions';
import NotificacoesForm from './NotificacoesForm';

export default async function NotificacoesPage() {
  const initialData = await getNotificationSettings();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Notificações e Alertas</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Configure quais canais de comunicação estão ativos no sistema.
      </p>

      <NotificacoesForm initialData={initialData} />
    </div>
  );
}
