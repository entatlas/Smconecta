'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserStatus } from '../[id]/actions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CandidateBlockButton({ profileId, initialStatus }: { profileId: string, initialStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const isBlocked = initialStatus === 'BLOCKED';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
      await toggleUserStatus(profileId, newStatus);
      toast.success(newStatus === 'BLOCKED' ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado com sucesso!');
      setOpen(false);
      router.refresh(); // Refresh the list
    } catch (error) {
      toast.error('Erro ao alterar status do usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        disabled={loading}
        style={{ 
          width: '40px', 
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: isBlocked ? 'rgba(239, 68, 68, 0.5)' : '',
          color: isBlocked ? '#ef4444' : '',
          background: isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
        }}
        title={isBlocked ? "Desbloquear Usuário" : "Bloquear Usuário"}
      >
        {isBlocked ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ background: '#031225', border: '1px solid #11284A', color: '#EAF2FF' }}>
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isBlocked ? '#10b981' : '#ef4444' }}>
              <AlertTriangle size={24} />
              {isBlocked ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
            </DialogTitle>
            <DialogDescription style={{ color: '#8B9BB4', paddingTop: '12px', fontSize: '1rem' }}>
              {isBlocked 
                ? 'Tem certeza que deseja DESBLOQUEAR este usuário? Ele voltará a ter acesso total à plataforma.' 
                : 'ATENÇÃO: Você está prestes a BLOQUEAR este usuário. Ele não poderá mais acessar a plataforma ou se candidatar a vagas. Deseja continuar?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} style={{ background: 'transparent', borderColor: '#11284A', color: '#EAF2FF' }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={loading}
              style={{ background: isBlocked ? '#10b981' : '#ef4444', color: 'white', border: 'none' }}
            >
              {loading ? 'Aguarde...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
