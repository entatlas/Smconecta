import React from 'react';
import { Skeleton } from './Skeleton';

export function SkeletonCard() {
  return (
    <div style={{ 
      background: '#031225', 
      border: '1px solid #11284A', 
      borderRadius: '12px', 
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="24px" />
        <Skeleton width="32px" height="32px" borderRadius="50%" />
      </div>
      <Skeleton width="100%" height="60px" />
      <Skeleton width="60%" height="16px" />
    </div>
  );
}
