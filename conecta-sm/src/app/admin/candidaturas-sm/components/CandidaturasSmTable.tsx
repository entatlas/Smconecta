'use client';

import React, { useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CandidaturaSM {
  id: string;
  candidateId: string;
  profileId: string;
  nome: string;
  email: string;
  telefone: string;
  data: Date;
  respostas: string;
}

export function CandidaturasSmTable({ candidaturas }: { candidaturas: CandidaturaSM[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidatura, setSelectedCandidatura] = useState<CandidaturaSM | null>(null);

  const filtered = candidaturas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-[#1A1A1A] dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Candidato</th>
              <th className="px-6 py-3 font-medium">E-mail / Telefone</th>
              <th className="px-6 py-3 font-medium">Data da Inscrição</th>
              <th className="px-6 py-3 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma candidatura encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((candidatura) => (
                <tr key={candidatura.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                  <td className="px-6 py-4 font-medium">{candidatura.nome}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{candidatura.email}</span>
                      <span className="text-gray-500 text-xs">{candidatura.telefone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(candidatura.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setSelectedCandidatura(candidatura)}
                      className="p-2 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 rounded-full transition-colors"
                      title="Ver Respostas do Formulário"
                    >
                      <Eye size={18} />
                    </button>
                    <Link 
                      href={`/admin/candidatos/${candidatura.profileId}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      {selectedCandidatura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#121212]">
              <h3 className="font-semibold text-lg flex flex-col">
                <span>Respostas do Formulário</span>
                <span className="text-sm font-normal text-gray-500">
                  {selectedCandidatura.nome}
                </span>
              </h3>
              <button 
                onClick={() => setSelectedCandidatura(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 prose prose-sm max-w-none dark:prose-invert">
              <Markdown>{selectedCandidatura.respostas}</Markdown>
            </div>
            
            <div className="p-4 border-t dark:border-gray-800 flex justify-end">
              <button 
                onClick={() => setSelectedCandidatura(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
