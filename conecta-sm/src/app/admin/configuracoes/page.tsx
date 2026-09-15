import React from 'react';
import ConfigTabs from './ConfigTabs';

// Actions das abas para carregar os dados
import { getAdmins } from './administradores/actions';

export default async function ConfiguracoesPage() {
  // Buscar os administradores
  const adminsData = await getAdmins();

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Configurações Globais</h1>
        <p className="text-slate-400 text-lg">Gerenciamento de acessos e configurações do painel administrativo.</p>
      </div>

      {/* Tabs Interface */}
      <ConfigTabs initialAdmins={adminsData} />
    </div>
  );
}
