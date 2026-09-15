import React from 'react';
import { getMarketIntelligenceData } from './actions';
import { Users, Building2, Briefcase, FileText, LineChart, Star, Activity, AlertCircle } from 'lucide-react';

export default async function InteligenciaMercadoPage() {
  const data = await getMarketIntelligenceData();
  const { overview, mostWanted, mostDemanded, supplyDemand } = data;

  const getInsights = () => {
    const insights = [];
    if (mostWanted.length > 0) {
      insights.push(`${mostWanted[0].name} é atualmente a área com maior número de candidatos interessados (${mostWanted[0].candidates} candidatos).`);
    }
    if (mostDemanded.length > 0) {
      insights.push(`${mostDemanded[0].name} possui o maior número de vagas publicadas (${mostDemanded[0].jobs} vagas).`);
    }
    const highConcentration = [...supplyDemand].sort((a, b) => b.opportunityIndex - a.opportunityIndex).filter(x => x.jobs > 0 && x.opportunityIndex > 5);
    if (highConcentration.length > 0) {
      insights.push(`${highConcentration[0].name} apresenta alta concorrência, com ${highConcentration[0].opportunityIndex.toFixed(1)} candidatos por vaga.`);
    }
    return insights;
  };

  const insights = getInsights();

  // Find max value for bar chart scaling
  const maxWanted = Math.max(...mostWanted.map(x => x.candidates), 1);
  const maxDemanded = Math.max(...mostDemanded.map(x => x.jobs), 1);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LineChart color="#00E5FF" /> Inteligência de Mercado
        </h1>
        <p style={{ color: '#94a3b8' }}>Entenda quais áreas profissionais estão concentrando interesse e oportunidades dentro do Conecta SM.</p>
      </div>

      {/* Visão Geral */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Candidatos', value: overview.totalCandidates, icon: <Users size={20} color="#00E5FF" /> },
          { label: 'Empresas', value: overview.totalCompanies, icon: <Building2 size={20} color="#10b981" /> },
          { label: 'Vagas', value: overview.totalJobs, icon: <Briefcase size={20} color="#f59e0b" /> },
          { label: 'Candidaturas', value: overview.totalApplications, icon: <FileText size={20} color="#3b82f6" /> },
          { label: 'Novos Candidatos (30d)', value: `+${overview.newCandidatesLast30Days}`, icon: <Activity size={20} color="#ec4899" /> },
          { label: 'Áreas Monitoradas', value: overview.totalAreas, icon: <Star size={20} color="#8b5cf6" /> },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Insights Dinâmicos */}
      {insights.length > 0 && (
        <div style={{ background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
          <h3 style={{ color: '#00E5FF', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Activity size={18} /> Principais Insights
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Áreas mais procuradas */}
        <div className="bg-[#031225] rounded-xl border border-[#11284A] p-6">
          <h3 className="text-white mt-0 mb-6 text-lg font-semibold">Áreas Profissionais Mais Procuradas</h3>
          <div className="flex flex-col gap-4">
            {mostWanted.length === 0 ? <p style={{ color: '#64748b' }}>Nenhum dado encontrado.</p> : null}
            {mostWanted.slice(0, 8).map((area, idx) => {
              const width = Math.max((area.candidates / maxWanted) * 100, 2);
              return (
                <div key={area.id}>
                  <div className="flex justify-between items-start sm:items-center text-sm mb-1 text-slate-300 gap-2">
                    <span className="break-words max-w-[70%]">{idx + 1}. {area.name}</span>
                    <span className="font-semibold text-right whitespace-nowrap">{area.candidates} {area.candidates === 1 ? 'candidato' : 'candidatos'}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, height: '100%', background: '#00E5FF', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demanda de Vagas */}
        <div className="bg-[#031225] rounded-xl border border-[#11284A] p-6">
          <h3 className="text-white mt-0 mb-6 text-lg font-semibold">Áreas Com Maior Demanda (Vagas)</h3>
          <div className="flex flex-col gap-4">
            {mostDemanded.length === 0 ? <p style={{ color: '#64748b' }}>Nenhuma vaga categorizada encontrada.</p> : null}
            {mostDemanded.slice(0, 8).map((area, idx) => {
              const width = Math.max((area.jobs / maxDemanded) * 100, 2);
              return (
                <div key={area.id}>
                  <div className="flex justify-between items-start sm:items-center text-sm mb-1 text-slate-300 gap-2">
                    <span className="break-words max-w-[70%]">{idx + 1}. {area.name}</span>
                    <span className="font-semibold text-emerald-500 text-right whitespace-nowrap">{area.jobs} {area.jobs === 1 ? 'vaga' : 'vagas'}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Oferta x Demanda */}
      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem' }}>Análise de Oferta x Demanda</h3>
        <div style={{ overflowX: 'auto' }}>
          <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 500 }}>Área Profissional</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 500 }}>Candidatos Interessados</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 500 }}>Vagas Disponíveis</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 500 }}>Índice (Cand/Vaga)</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 500 }}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {[...supplyDemand]
                .filter(x => x.candidates > 0 || x.jobs > 0)
                .sort((a, b) => b.opportunityIndex - a.opportunityIndex)
                .map(area => {
                  let sitLabel = "Equilibrado";
                  let sitColor = "#94a3b8";
                  if (area.jobs === 0 && area.candidates > 0) {
                    sitLabel = "Sem Oportunidades";
                    sitColor = "#ef4444";
                  } else if (area.opportunityIndex > 5) {
                    sitLabel = "Alta Concentração";
                    sitColor = "#f59e0b";
                  } else if (area.opportunityIndex < 1.5 && area.jobs > 0) {
                    sitLabel = "Alta Oportunidade";
                    sitColor = "#10b981";
                  }

                  return (
                    <tr key={area.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', color: '#fff' }}>{area.name}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{area.candidates}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{area.jobs}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1', fontWeight: 600 }}>
                        {area.jobs === 0 ? '∞' : area.opportunityIndex.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: `${sitColor}20`, color: sitColor }}>
                          {sitLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

    </div>
  );
}
