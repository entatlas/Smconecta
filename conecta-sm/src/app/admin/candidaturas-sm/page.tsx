import React from 'react';
import { getSMCandidaturas } from './actions';
import { CandidaturasSmTable } from './components/CandidaturasSmTable';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Candidaturas SM | Painel Administrativo',
  description: 'Gerenciamento de inscrições do Trabalhe Conosco da SM',
};

export default async function CandidaturasSmPage() {
  const { data: candidaturas, success, error } = await getSMCandidaturas();

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-[#1E3A8A]" />
            Candidaturas SM
          </h1>
          <p className="text-gray-500 mt-1">
            Inscrições recebidas através do formulário "Trabalhe Conosco" da Equipe Técnica Multidisciplinar.
          </p>
        </div>
      </div>

      {!success ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      ) : (
        <CandidaturasSmTable candidaturas={candidaturas || []} />
      )}
    </div>
  );
}
