'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserStatus } from '../actions';

export function UserStatusToggle({ profileId, initialStatus }: { profileId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const isBlocked = status === 'BLOCKED';

  const handleToggle = async () => {
    if (isBlocked) {
      // Confirm before unblocking
      if (!confirm('Tem certeza que deseja DESBLOQUEAR este usuário? Ele voltará a ter acesso à plataforma.')) return;
    } else {
      // Confirm before blocking
      if (!confirm('ATENÇÃO: Você está prestes a BLOQUEAR este usuário. Ele não poderá mais acessar a plataforma ou se candidatar a vagas. Confirmar?')) return;
    }

    setLoading(true);
    try {
      const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
      await toggleUserStatus(profileId, newStatus);
      setStatus(newStatus);
      toast.success(newStatus === 'BLOCKED' ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar status do usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50
        ${isBlocked 
          ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300'
        }`}
    >
      {isBlocked ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
      {isBlocked ? 'Usuário Bloqueado' : 'Usuário Ativo'}
    </button>
  );
}
