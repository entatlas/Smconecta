'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateCompanyStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

export function CompanyActionButtons({ profileId, currentStatus }: { profileId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: 'ACTIVE' | 'PENDING' | 'BLOCKED') => {
    setLoading(true);
    try {
      await updateCompanyStatus(profileId, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      {currentStatus !== 'ACTIVE' && (
        <Button 
          variant="outline" 
          onClick={() => handleUpdate('ACTIVE')} 
          disabled={loading}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: '#10b981', color: '#10b981' }}
        >
          <CheckCircle size={16} /> Aprovar
        </Button>
      )}
      
      {currentStatus !== 'BLOCKED' && (
        <Button 
          variant="outline" 
          onClick={() => handleUpdate('BLOCKED')} 
          disabled={loading}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: '#ef4444', color: '#ef4444' }}
        >
          <XCircle size={16} /> Bloquear
        </Button>
      )}
    </div>
  );
}
