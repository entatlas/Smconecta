'use client';

import React, { useState } from 'react';
import { addCandidateHistoryEvent } from '../actions';
import { Clock, Plus, CheckCircle, AlertTriangle, Briefcase, FileText, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';

type CandidateHistoryProps = {
  candidateId: string;
  historyEvents: Array<{
    id: string;
    eventType: string;
    title: string;
    description: string | null;
    eventDate: Date | string;
    createdBy: {
      nome: string;
      tipo: string;
    } | null;
  }>;
};

export function CandidateHistory({ candidateId, historyEvents, profileId }: CandidateHistoryProps & { profileId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('FEEDBACK_POSITIVE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCandidateHistoryEvent(candidateId, type, title, description, profileId);
      toast.success('Ocorrência registrada com sucesso.');
      setIsOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error('Erro ao registrar ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FEEDBACK_POSITIVE': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'FEEDBACK_NEGATIVE': return <AlertTriangle size={18} className="text-red-500" />;
      case 'HIRED': return <Briefcase size={18} className="text-blue-500" />;
      case 'FIRED': return <Briefcase size={18} className="text-orange-500" />;
      default: return <FileText size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="mt-8 bg-[#061A32] border border-[#11284A] rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Histórico Confidencial (Ocorrências)
          </h3>
          <p className="text-sm text-slate-400">Visível apenas para Empresas e Administradores</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[#031225] border border-[#11284A] p-4 rounded-lg flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Tipo de Registro</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="bg-[#061A32] border border-[#11284A] text-white rounded-md p-2 outline-none focus:border-blue-500"
            >
              <option value="FEEDBACK_POSITIVE">Ponto Positivo (Gostou, Boa entrevista)</option>
              <option value="FEEDBACK_NEGATIVE">Ponto Negativo (Faltou, Problemas)</option>
              <option value="HIRED">Contratação</option>
              <option value="FIRED">Desligamento / Demissão</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Título Curto</label>
            <input 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Faltou na entrevista agendada"
              className="bg-[#061A32] border border-[#11284A] text-white rounded-md p-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Detalhes</label>
            <textarea 
              required
              rows={3}
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre o ocorrido..."
              className="bg-[#061A32] border border-[#11284A] text-white rounded-md p-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-md text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      )}

      {historyEvents.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-[#11284A] rounded-lg">
          Nenhuma ocorrência registrada para este candidato.
        </div>
      ) : (
        <div className="relative border-l border-[#11284A] ml-3 pl-6 space-y-6">
          {historyEvents.map((evt) => {
            // Regra principal solicitada pelo usuário:
            // Se foi Admin, mostra "Funcionário (SM)", senão mostra "Empresa Parceira" ou o nome da empresa.
            const isSM = evt.createdBy?.tipo === 'ADMIN';
            const authorName = isSM ? 'Funcionário (SM)' : (evt.createdBy?.nome || 'Empresa Parceira');
            
            return (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[34px] w-6 h-6 rounded-full bg-[#031225] border border-[#11284A] flex items-center justify-center">
                  {getEventIcon(evt.eventType)}
                </div>
                <div>
                  <h4 className="text-white font-medium flex items-center gap-2">
                    {evt.title}
                  </h4>
                  <div className="text-sm text-slate-400 mt-1 prose prose-sm prose-invert max-w-none">
                    <Markdown>{evt.description || ''}</Markdown>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-[#11284A]">
                      <UserCircle size={12} className={isSM ? 'text-purple-400' : 'text-blue-400'} />
                      {authorName}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(evt.eventDate))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
