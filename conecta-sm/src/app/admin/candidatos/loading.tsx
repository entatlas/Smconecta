import React from 'react';
import { SkeletonCard } from '@/components/ui/Loading/SkeletonCard';
import { Skeleton } from '@/components/ui/Loading/Skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CandidatosLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <Skeleton width="300px" height="40px" style={{ marginBottom: '8px' }} />
          <Skeleton width="400px" height="24px" />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="default" disabled style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.5 }}>
            <Plus size={16} /> Adicionar Candidato
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
