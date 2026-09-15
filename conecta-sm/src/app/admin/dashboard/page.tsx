'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, Building2, TrendingUp, LineChart, PieChart, UserPlus, FileText, CheckCircle, Activity, ChevronRight, BarChart3, Globe, Bell } from 'lucide-react';
import { getRecentActivities, getDashboardStats } from './actions';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const GrowthChart = dynamic(() => import('./DashboardCharts').then(mod => mod.GrowthChart), { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-slate-800 rounded-lg"></div> });
const HiringPieChart = dynamic(() => import('./DashboardCharts').then(mod => mod.HiringPieChart), { ssr: false, loading: () => <div className="h-[250px] w-full animate-pulse bg-slate-800 rounded-lg text-slate-400 flex items-center justify-center">Carregando gráfico...</div> });
const DemandAreaChart = dynamic(() => import('./DashboardCharts').then(mod => mod.DemandAreaChart), { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-slate-800 rounded-lg text-slate-400 flex items-center justify-center">Carregando gráfico...</div> });

// Graficos agora puxam dados reais do backend (actions.ts)

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rawStats, recentActivities] = await Promise.all([
          getDashboardStats(),
          getRecentActivities()
        ]);
        setStats(rawStats);
        setActivities(recentActivities);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEW_CANDIDATE': return <UserPlus size={20} className="text-blue-500" />;
      case 'NEW_COMPANY': return <Building2 size={20} className="text-indigo-500" />;
      case 'NEW_JOB': return <Briefcase size={20} className="text-emerald-500" />;
      case 'NEW_APPLICATION': return <FileText size={20} className="text-amber-500" />;
      default: return <CheckCircle size={20} className="text-slate-400" />;
    }
  };

  const statCards = stats ? [
    { label: 'Candidatos', value: stats.totalCandidates, icon: Users, desc: 'Total cadastrados', bg: 'from-blue-500/20 to-blue-600/5', color: 'text-blue-500', href: '/admin/candidatos' },
    { label: 'Empresas', value: stats.totalCompanies, icon: Building2, desc: 'Parceiros ativos', bg: 'from-indigo-500/20 to-indigo-600/5', color: 'text-indigo-500', href: '/admin/empresas' },
    { label: 'Vagas', value: stats.openJobs, icon: Briefcase, desc: 'Abertas atualmente', bg: 'from-emerald-500/20 to-emerald-600/5', color: 'text-emerald-500', href: '/admin/vagas' },
    { label: 'Empregabilidade', value: `${stats.employabilityIndex}%`, icon: TrendingUp, desc: 'Índice de conversão', bg: 'from-purple-500/20 to-purple-600/5', color: 'text-purple-500', href: '/admin/candidaturas' },
  ] : [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 animate-pulse text-blue-500" />
          <p className="text-lg font-medium text-slate-400">Carregando ecossistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-950 text-slate-50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Globe size={14} />
            Visão Geral 360º
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Métricas em tempo real do ecossistema Conecta SM</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Última atualização</p>
            <p className="text-sm font-medium text-emerald-400 flex items-center gap-1 justify-end">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Agora
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href} className="block">
              <Card className="relative overflow-hidden group bg-slate-900 border-slate-800 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="relative p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</span>
                    <div className={`p-2.5 rounded-xl bg-slate-950/50 backdrop-blur-md border border-white/5 ${stat.color} shadow-inner`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold tracking-tight text-white mb-1 drop-shadow-sm">{stat.value}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-400" size={20} />
                Crescimento da Plataforma
              </h3>
              <p className="text-sm text-slate-400">Evolução de novos usuários nos últimos 7 meses</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <GrowthChart stats={stats} />
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="text-emerald-400" size={20} />
              Status de Candidaturas
            </h3>
            <p className="text-sm text-slate-400">Distribuição do funil atual</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full relative flex items-center justify-center">
            <HiringPieChart stats={stats} />
            {/* Center Label inside Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{(stats?.hiringData || []).reduce((acc: number, curr: any) => acc + curr.value, 0)}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {stats?.hiringData?.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Areas of Interest */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={20} />
              Áreas Mais Desejadas
            </h3>
            <p className="text-sm text-slate-400">Demanda de candidatos por área de interesse</p>
          </div>
          <div className="flex-1 min-h-[300px] w-full relative flex items-center justify-center">
            <DemandAreaChart stats={stats} />
          </div>
        </Card>

        {/* You can add another chart or widget here if needed to balance the 2-col grid. For now, we will let it span if we just want one, but we used lg:grid-cols-2 so it will take half width */}
      </div>
      
      {/* ACTIVITY FEED */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 overflow-hidden">
        <div className="border-b border-slate-800 p-6 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="text-indigo-400" size={20} />
              Atividade Recente
            </h3>
            <p className="text-sm text-slate-400">Acontecimentos em tempo real na plataforma</p>
          </div>
          <Link href="/admin/atividades" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium">
            Ver tudo <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="p-2">
          {activities.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                <Bell className="text-slate-500 opacity-50" size={24} />
              </div>
              <h4 className="text-slate-300 font-medium mb-1">Tudo calmo por aqui</h4>
              <p className="text-sm text-slate-500 max-w-sm">Nenhuma atividade registrada no sistema ainda. As interações dos usuários aparecerão aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((act, index) => (
                <div 
                  key={act.id} 
                  className={`flex gap-4 p-4 hover:bg-slate-800/50 transition-colors rounded-xl mx-2 ${index !== activities.length -1 ? 'border-b border-slate-800/50' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                      {getIconForType(act.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-medium text-slate-200">{act.title}</h4>
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        {act.timeAgo}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
