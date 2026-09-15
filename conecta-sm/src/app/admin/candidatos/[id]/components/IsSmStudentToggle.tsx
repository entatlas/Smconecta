'use client';

import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { toggleSmStudentStatus } from '../actions';

export function IsSmStudentToggle({ candidateId, initialStatus, profileId }: { candidateId: string, initialStatus: boolean, profileId: string }) {
  const [isStudent, setIsStudent] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !isStudent;
      await toggleSmStudentStatus(candidateId, newStatus, profileId);
      setIsStudent(newStatus);
      toast.success(newStatus ? 'Marcado como Aluno SM' : 'Removida tag de Aluno SM');
    } catch (error) {
      toast.error('Erro ao alterar status de aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50
        ${isStudent 
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30' 
          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-300'
        }`}
    >
      <GraduationCap size={16} />
      {isStudent ? 'Aluno SM' : 'Marcar como Aluno SM'}
    </button>
  );
}
