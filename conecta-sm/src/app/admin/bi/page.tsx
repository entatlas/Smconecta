import React from 'react';
import Link from 'next/link';
import { getBIData } from './actions';
import { Users, Briefcase, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import { EvolutionChart, AreasChart, RecruitmentFunnel } from '@/components/bi/Charts';

export default async function AdminBIDashboard() {
  const data = await getBIData();
  const { kpis, evolutionData, topAreas, funnelData } = data;

  const kpiCards = [
    { title: 'Total de Usuários', value: kpis.totalUsers, icon: Users, color: '#3b82f6', href: '/admin/candidatos' },
    { title: 'Candidatos', value: kpis.totalCandidates, icon: Users, color: '#10b981', href: '/admin/candidatos' },
    { title: 'Empresas', value: kpis.totalCompanies, icon: Building2, color: '#8b5cf6', href: '/admin/empresas' },
    { title: 'Vagas', value: kpis.totalJobs, icon: Briefcase, color: '#f59e0b', href: '/admin/vagas' },
    { title: 'Candidaturas', value: kpis.totalApplications, icon: TrendingUp, color: '#ef4444', href: '/admin/candidaturas' },
    { title: 'Cursos', value: kpis.totalCourses, icon: GraduationCap, color: '#06b6d4', href: '/admin/cursos' }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF' }}>Inteligência e BI</h1>
        <p style={{ color: '#8B9BB4', marginTop: '8px', fontSize: '1.125rem' }}>
          Visão executiva em tempo real dos indicadores do ecossistema.
        </p>
      </header>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {kpiCards.map((kpi, i) => (
          <Link href={kpi.href} key={i} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#031225', borderRadius: '12px', padding: '24px', border: '1px solid #11284A', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', transition: 'all 0.2s', ...{ ':hover': { transform: 'translateY(-2px)' } } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <kpi.icon size={20} />
                </div>
                <p style={{ color: '#8B9BB4', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{kpi.title}</p>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: 0 }}>{kpi.value.toLocaleString('pt-BR')}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        <div style={{ background: '#031225', borderRadius: '12px', padding: '24px', border: '1px solid #11284A' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EAF2FF', marginBottom: '24px' }}>Evolução de Cadastros</h3>
          <EvolutionChart data={evolutionData} />
        </div>

        <div style={{ background: '#031225', borderRadius: '12px', padding: '24px', border: '1px solid #11284A' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EAF2FF', marginBottom: '24px' }}>Áreas Mais Procuradas</h3>
          <AreasChart data={topAreas} />
        </div>

        <div style={{ background: '#031225', borderRadius: '12px', padding: '24px', border: '1px solid #11284A' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EAF2FF', marginBottom: '24px' }}>Funil de Recrutamento</h3>
          <RecruitmentFunnel data={funnelData} />
        </div>

      </div>
    </div>
  );
}
