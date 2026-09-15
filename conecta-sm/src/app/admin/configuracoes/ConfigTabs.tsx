'use client';

import React, { useState } from 'react';
import { Users, Lock } from 'lucide-react';
import AdministradoresList from './administradores/AdministradoresList';
import ResetPasswordForm from './seguranca/ResetPasswordForm';

export default function ConfigTabs({ initialAdmins }: any) {
  const [activeTab, setActiveTab] = useState('administradores');

  const tabs = [
    { id: 'administradores', label: 'Gestão de Administradores', icon: <Users size={18} /> },
    { id: 'seguranca', label: 'Segurança da Minha Conta', icon: <Lock size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Menu Lateral das Tabs */}
      <div className="w-full md:w-64 flex-shrink-0">
        <nav className="flex flex-col space-y-2 bg-[#061A32] p-4 rounded-2xl border border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold outline-none ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="flex-1 bg-[#061A32] rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-lg min-h-[500px]">
        {activeTab === 'administradores' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-4">Gestão de Administradores</h2>
            <p className="text-slate-400 mb-6">Aqui você gerencia todos os usuários que têm acesso ao painel administrativo da SM Soluções.</p>
            <AdministradoresList initialData={initialAdmins} />
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-4">Segurança da Minha Conta</h2>
            <p className="text-slate-400 mb-6">Atualize suas credenciais de acesso ao painel.</p>
            <ResetPasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}
