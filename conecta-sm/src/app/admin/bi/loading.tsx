import React from 'react';
import { SkeletonCard } from '@/components/ui/Loading/SkeletonCard';
import { Skeleton } from '@/components/ui/Loading/Skeleton';

export default function BILoading() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <Skeleton width="300px" height="40px" style={{ marginBottom: '8px' }} />
        <Skeleton width="400px" height="24px" />
      </header>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ background: '#031225', borderRadius: '12px', padding: '24px', border: '1px solid #11284A' }}>
            <Skeleton width="200px" height="24px" style={{ marginBottom: '24px' }} />
            <Skeleton width="100%" height="300px" />
          </div>
        ))}
      </div>
    </div>
  );
}
