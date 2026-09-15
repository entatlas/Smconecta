import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { getCandidates } from './actions';
import { CandidateBlockButton } from './components/CandidateBlockButton';

export default async function CandidatosPage() {
  const candidates = await getCandidates();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Banco de Talentos</h1>
          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Gerencie todos os candidatos cadastrados no ecossistema.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/candidatos/novo" style={{ textDecoration: 'none' }}>
            <Button variant="default" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Plus size={16} /> Adicionar Candidato
            </Button>
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState 
          icon={<Users size={64} style={{ opacity: 0.2 }} color="var(--color-primary)" />}
          title="Nenhum candidato encontrado"
          description="Nenhum candidato foi encontrado na base de dados com o perfil configurado."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {candidates.map(candidate => (
            <div key={candidate.id} style={{ 
              background: '#031225', 
              border: '1px solid #11284A', 
              borderRadius: '12px', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#061A32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D9FF' }}>
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#EAF2FF' }}>{candidate.nome}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#00D9FF' }}>{candidate.candidateProfile?.headline || candidate.candidateProfile?.desiredRole || 'Candidato'}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #11284A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Mail size={16} />
                  <span>{candidate.email}</span>
                </div>
                {candidate.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                    <Phone size={16} />
                    <span>{candidate.telefone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Calendar size={16} />
                  <span>Membro desde {new Date(candidate.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                <Link href={`/admin/candidatos/${candidate.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <Button variant="outline" style={{ width: '100%' }}>Ver Perfil</Button>
                </Link>
                <CandidateBlockButton profileId={candidate.id} initialStatus={candidate.status || 'ACTIVE'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
