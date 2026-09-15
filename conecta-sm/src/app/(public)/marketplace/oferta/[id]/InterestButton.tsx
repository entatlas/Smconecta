'use client';

import React, { useState } from 'react';
import { requestOfferInterest } from '../../actions';
import { Loader2 } from 'lucide-react';

export function InterestButton({ offerId }: { offerId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    const res = await requestOfferInterest(offerId);
    if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <button 
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background 0.2s'
        }}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Tenho Interesse'}
      </button>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}
