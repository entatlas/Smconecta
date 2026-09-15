'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransactionModal } from './components/TransactionModal';
import { PlusCircle, ArrowUpRight } from 'lucide-react';

export function FinanceDashboardClient() {
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME'>('INCOME');

  useEffect(() => {
    if (searchParams.get('nova') === 'true') {
      setModalType('INCOME');
      setModalOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => { setModalType('INCOME'); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <ArrowUpRight size={20} /> Nova Receita
        </button>
      </div>

      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        defaultType={modalType} 
      />
    </>
  );
}
