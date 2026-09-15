'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateJobStatus, deleteJob } from '../actions';
import { useRouter } from 'next/navigation';
import { Play, Pause, Trash2 } from 'lucide-react';

export function JobActionButtons({ jobId, currentStatus }: { jobId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: 'PUBLISHED' | 'PAUSED' | 'CLOSED') => {
    setLoading(true);
    try {
      await updateJobStatus(jobId, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta vaga? Esta ação é irreversível.')) return;
    setLoading(true);
    try {
      await deleteJob(jobId);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir vaga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      {currentStatus === 'PAUSED' && (
        <Button 
          variant="outline" 
          onClick={() => handleUpdate('PUBLISHED')} 
          disabled={loading}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: '#10b981', color: '#10b981' }}
        >
          <Play size={16} /> Ativar
        </Button>
      )}
      
      {currentStatus === 'PUBLISHED' && (
        <Button 
          variant="outline" 
          onClick={() => handleUpdate('PAUSED')} 
          disabled={loading}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          <Pause size={16} /> Pausar
        </Button>
      )}

      <Button 
        variant="outline" 
        onClick={handleDelete} 
        disabled={loading}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: '#ef4444', color: '#ef4444' }}
      >
        <Trash2 size={16} /> Excluir
      </Button>
    </div>
  );
}
