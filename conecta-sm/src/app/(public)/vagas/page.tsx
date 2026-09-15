import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Search, Briefcase } from 'lucide-react';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function VagasList() {
  const dbVagas = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: { company: true }
  });

  const vagas = dbVagas;

  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Vagas em <span className={styles.highlight}>Destaque</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Descubra oportunidades alinhadas ao seu perfil e dê o próximo passo na sua carreira.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {vagas.length > 0 ? vagas.map((vaga) => (
              <Link href={`/vagas/${vaga.id}`} key={vaga.id} style={{ display: 'block', textDecoration: 'none', background: 'rgba(8, 120, 255, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(8, 120, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{vaga.title}</h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(8, 120, 255, 0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>{vaga.employmentType}</span>
                </div>
                
                <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={16} /> {vaga.company.companyName}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {vaga.city || 'Local não informado'} ({vaga.modality})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {vaga.workload || 'Horário a combinar'}</span>
                </div>
                
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '2rem' }}>
                  {vaga.description}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className={styles.btnPrimary} style={{ flex: 1, textAlign: 'center', padding: '0.75rem' }}>
                    Ver Detalhes
                  </span>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(8, 120, 255, 0.1)', borderRadius: '16px' }}>
                <Search size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nenhuma vaga encontrada</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>No momento não temos vagas públicas disponíveis. Cadastre-se no Banco de Talentos para ser notificado.</p>
                <Link href="/cadastro" className={styles.btnSecondary} style={{ display: 'inline-block', marginTop: '1.5rem' }}>Cadastrar Currículo</Link>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
