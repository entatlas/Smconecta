import React from 'react';
import { getRecentActivities } from '@/app/admin/dashboard/actions';
import { UserPlus, Building2, Briefcase, FileText, CheckCircle, Activity, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AtividadesPage() {
  const activities = await getRecentActivities(); // Currently fetches 20, can be expanded if needed

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEW_CANDIDATE': return <UserPlus size={20} className="text-blue-500" />;
      case 'NEW_COMPANY': return <Building2 size={20} className="text-indigo-500" />;
      case 'NEW_JOB': return <Briefcase size={20} className="text-emerald-500" />;
      case 'NEW_APPLICATION': return <FileText size={20} className="text-amber-500" />;
      default: return <CheckCircle size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1000px] mx-auto min-h-screen bg-slate-950 text-slate-50">
      <div className="flex flex-col gap-4">
        <Link href="/admin/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 w-fit text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Activity className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Histórico de Atividades
            </h1>
            <p className="text-slate-400 text-sm">Registro completo de acontecimentos da plataforma</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center p-12 text-slate-400">Nenhuma atividade registrada.</div>
          ) : (
            <div className="relative border-l border-slate-800 ml-4 space-y-8 pb-4">
              {activities.map((act) => (
                <div key={act.id} className="relative pl-8 group">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-slate-600 group-hover:scale-110 transition-all">
                    {getIconForType(act.type)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 bg-slate-900/50 p-4 rounded-xl border border-transparent group-hover:border-slate-800 group-hover:bg-slate-800/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-base">{act.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{act.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        {act.timeAgo}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(act.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
