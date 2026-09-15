import React from 'react';
import { PageLoader } from '@/components/ui/Loading/PageLoader';

export default function Loading() {
  return (
    <div style={{ paddingTop: '120px', minHeight: '60vh' }}>
      <PageLoader message="Carregando catálogo de cursos..." />
    </div>
  );
}
