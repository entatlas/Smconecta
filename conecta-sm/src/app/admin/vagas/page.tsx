import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, MapPin, Building2, Users, Calendar, CheckCircle, ShieldAlert, Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { getVagas } from './actions';
import { JobActionButtons } from './components/JobActionButtons';

export default async function VagasPage() {
  const vagas = await getVagas();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Mural de Vagas</h1>
          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Visão geral de todas as oportunidades de emprego ativas no sistema.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/vagas/nova">
            <Button variant="default" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Plus size={16} /> Nova Vaga
            </Button>
          </Link>
        </div>
      </div>

      {vagas.length === 0 ? (
        <EmptyState 
          icon={<Briefcase size={64} style={{ opacity: 0.2 }} color="var(--color-primary)" />}
          title="Nenhuma vaga publicada"
          description="Ainda não existem vagas cadastradas no sistema. As vagas publicadas pelas empresas aparecerão aqui."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {vagas.map(vaga => (
            <div key={vaga.id} style={{ 
              background: '#031225', 
              border: '1px solid #11284A', 
              borderRadius: '12px', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#061A32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D9FF' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#EAF2FF' }}>{vaga.title}</h3>
                    {vaga.status === 'PUBLISHED' && <CheckCircle size={14} color="#10b981" />}
                    {vaga.status === 'PAUSED' && <Clock size={14} color="#f59e0b" />}
                    {vaga.status === 'CLOSED' && <ShieldAlert size={14} color="#ef4444" />}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#00D9FF' }}>
                    {vaga.status === 'PUBLISHED' ? 'Vaga Aberta' : vaga.status === 'PAUSED' ? 'Vaga Pausada' : 'Vaga Fechada'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #11284A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Building2 size={16} />
                  <span>{vaga.company?.companyName || 'Empresa não informada'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <MapPin size={16} />
                  <span>{vaga.modality} - {vaga.employmentType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Users size={16} />
                  <span>{vaga._count?.applications || 0} candidaturas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Calendar size={16} />
                  <span>Publicada em {new Date(vaga.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <JobActionButtons jobId={vaga.id} currentStatus={vaga.status} />
                <Link href={`/admin/vagas/${vaga.id}`} style={{ width: '100%' }}>
                  <Button variant="outline" style={{ width: '100%' }}>Ver Detalhes</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
