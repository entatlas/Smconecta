import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, Building2, MapPin, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function VagaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vaga = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: true,
    }
  });

  if (!vaga) {
    notFound();
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <Link href="/admin/vagas">
        <Button variant="outline" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ArrowLeft size={16} /> Voltar para Vagas
        </Button>
      </Link>

      <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '12px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#061A32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D9FF' }}>
            <Briefcase size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>{vaga.title}</h1>
            <div style={{ display: 'flex', gap: '16px', color: '#8B9BB4' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} /> {vaga.company?.companyName || 'Empresa não informada'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {vaga.modality} - {vaga.employmentType}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: vaga.status === 'PUBLISHED' ? '#10b981' : vaga.status === 'PAUSED' ? '#f59e0b' : '#ef4444' }}>
                {vaga.status === 'PUBLISHED' && <CheckCircle size={16} />}
                {vaga.status === 'PAUSED' && <Clock size={16} />}
                {vaga.status === 'CLOSED' && <ShieldAlert size={16} />}
                {vaga.status === 'PUBLISHED' ? 'Aberta' : vaga.status === 'PAUSED' ? 'Pausada' : 'Fechada'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#00D9FF', marginBottom: '8px' }}>Descrição da Vaga</h3>
            <div style={{ color: '#EAF2FF', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{vaga.description}</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#061A32', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: '#8B9BB4', fontSize: '0.875rem', marginBottom: '4px' }}>Salário</p>
              <p style={{ fontWeight: 600 }}>
                {vaga.salaryVisibility && vaga.salaryMin && vaga.salaryMax 
                  ? `R$ ${vaga.salaryMin} - R$ ${vaga.salaryMax}` 
                  : vaga.salaryVisibility && vaga.salaryMin 
                  ? `A partir de R$ ${vaga.salaryMin}`
                  : 'A combinar'}
              </p>
            </div>
            <div style={{ background: '#061A32', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: '#8B9BB4', fontSize: '0.875rem', marginBottom: '4px' }}>Nível de Experiência</p>
              <p style={{ fontWeight: 600 }}>{vaga.experienceLevel || 'Não especificado'}</p>
            </div>
            <div style={{ background: '#061A32', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: '#8B9BB4', fontSize: '0.875rem', marginBottom: '4px' }}>Candidaturas</p>
              <p style={{ fontWeight: 600 }}>{vaga.applications.length} candidatos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
