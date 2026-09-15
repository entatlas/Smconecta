'use client';

import React from 'react';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { GlobalSearch } from '@/components/layout/GlobalSearch';

export function AdminHeader() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '0.625rem 1.5rem',
      backgroundColor: 'var(--color-bg-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '0.75rem',
    }}>
      {/* Busca global */}
      <GlobalSearch />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Notificações */}
      <NotificationDropdown />
    </header>
  );
}
