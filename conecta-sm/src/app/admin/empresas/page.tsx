import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Building2, MapPin, Briefcase, Calendar, Mail, Phone, Users, ShieldAlert, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { getEmpresas } from './actions';
import { CompanyActionButtons } from './components/CompanyActionButtons';

export default async function EmpresasPage() {
  const empresas = await getEmpresas();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Empresas B2B</h1>
          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Visão unificada das empresas e clientes corporativos cadastrados.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/empresas/nova" style={{ textDecoration: 'none' }}>
            <Button variant="default" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Plus size={16} /> Cadastrar Empresa
            </Button>
          </Link>
        </div>
      </div>

      {empresas.length === 0 ? (
        <EmptyState 
          icon={<Building2 size={64} style={{ opacity: 0.2 }} color="var(--color-primary)" />}
          title="Nenhuma empresa cadastrada"
          description="Nenhuma conta corporativa foi localizada na base de dados do sistema."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {empresas.map(empresa => (
            <div key={empresa.id} style={{ 
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
                  <Building2 size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#EAF2FF' }}>{empresa.companyProfile?.companyName || empresa.nome}</h3>
                    {empresa.status === 'ACTIVE' && <CheckCircle size={14} color="#10b981" />}
                    {empresa.status === 'BLOCKED' && <ShieldAlert size={14} color="#ef4444" />}
                    {empresa.status === 'PENDING' && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f59e0b20', color: '#f59e0b', borderRadius: '4px' }}>Pendente</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#00D9FF' }}>{empresa.companyProfile?.tradeName || 'Nome fantasia não informado'}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #11284A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Mail size={16} />
                  <span>{empresa.email}</span>
                </div>
                {empresa.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                    <Phone size={16} />
                    <span>{empresa.telefone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <MapPin size={16} />
                  <span>{empresa.companyProfile?.cnpj ? `CNPJ: ${empresa.companyProfile.cnpj}` : 'CNPJ não informado'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Briefcase size={16} />
                  <span>{(empresa as any)._count?.jobs || 0} vagas publicadas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                  <Calendar size={16} />
                  <span>Registrada em {new Date(empresa.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <CompanyActionButtons profileId={empresa.id} currentStatus={empresa.status} />
                <Link href={`/admin/empresas/${empresa.id}`} style={{ textDecoration: 'none', width: '100%' }}>
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
