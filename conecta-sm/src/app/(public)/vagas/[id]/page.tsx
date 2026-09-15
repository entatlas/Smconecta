import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Briefcase, GraduationCap, CalendarDays, CheckCircle2, ExternalLink, Camera, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from '../../page.module.css';

export default async function VagaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let vaga = await prisma.job.findUnique({
    where: { id: id },
    include: { company: true }
  });

  if (!vaga || vaga.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.heroText}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(8, 120, 255, 0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {vaga.employmentType}
              </span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(8, 120, 255, 0.1)', color: 'var(--color-text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {vaga.modality}
              </span>
            </div>
            <h1>{vaga.title}</h1>
            <p className={styles.heroSubtitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginTop: '1rem' }}>
              <Briefcase size={20} /> {vaga.company.companyName}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            {/* Detalhes Principais */}
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Sobre a Vaga
              </h2>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown>{vaga.description}</ReactMarkdown>
              </div>

              {vaga.benefits && (
                <>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>Benefícios</h2>
                  <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown>{vaga.benefits}</ReactMarkdown>
                  </div>
                </>
              )}

              {/* Sobre a Empresa - Premium Design */}
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={24} color="var(--color-primary)" /> Conheça a Empresa
              </h2>
              
              <div style={{ 
                background: 'linear-gradient(145deg, rgba(8, 120, 255, 0.08) 0%, rgba(8, 120, 255, 0.02) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '2.5rem', 
                borderRadius: '24px', 
                border: '1px solid rgba(8, 120, 255, 0.15)', 
                marginBottom: '4rem',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative background element */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'var(--color-primary)',
                  filter: 'blur(80px)',
                  opacity: 0.15,
                  borderRadius: '50%',
                  zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Logo Box with Glow */}
                    <div style={{ 
                      padding: '4px',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(8, 120, 255, 0.2) 100%)',
                      borderRadius: '50%',
                      boxShadow: '0 4px 15px rgba(8, 120, 255, 0.2)'
                    }}>
                      {vaga.company.logoUrl ? (
                        <img src={vaga.company.logoUrl} alt={vaga.company.companyName} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-background)' }} />
                      ) : (
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: '800', border: '2px solid transparent' }}>
                          {vaga.company.companyName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '200px', alignSelf: 'center' }}>
                      <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{vaga.company.companyName}</h3>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {vaga.company.industry && (
                          <span style={{ fontSize: '0.85rem', background: 'var(--color-background)', color: 'var(--color-primary)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(8, 120, 255, 0.2)' }}>
                            {vaga.company.industry}
                          </span>
                        )}
                        {(vaga.company.city || vaga.company.state) && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={16} color="var(--color-primary)" />
                            {vaga.company.city}{vaga.company.state ? ` - ${vaga.company.state}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(8,120,255,0.2) 0%, transparent 100%)', marginBottom: '2rem' }}></div>
                  
                  {/* Description */}
                  <div style={{ marginBottom: '2rem' }}>
                    {vaga.company.description ? (
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>
                        {vaga.company.description}
                      </p>
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                        Esta empresa está em constante crescimento e logo adicionará mais detalhes sobre sua cultura e história.
                      </p>
                    )}
                  </div>

                  {/* Social Links Styled as Pills */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {vaga.company.website && (
                      <a href={vaga.company.website.startsWith('http') ? vaga.company.website : `https://${vaga.company.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 1.25rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid rgba(8, 120, 255, 0.2)', transition: 'all 0.2s', cursor: 'pointer' }}>
                        <ExternalLink size={18} color="var(--color-primary)" /> Site Oficial
                      </a>
                    )}
                    {vaga.company.linkedin && (
                      <a href={vaga.company.linkedin.startsWith('http') ? vaga.company.linkedin : `https://${vaga.company.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 1.25rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid rgba(10, 102, 194, 0.3)', transition: 'all 0.2s', cursor: 'pointer' }}>
                        <Briefcase size={18} color="#0a66c2" /> LinkedIn
                      </a>
                    )}
                    {vaga.company.instagram && (
                      <a href={vaga.company.instagram.startsWith('http') ? vaga.company.instagram : `https://instagram.com/${vaga.company.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', padding: '0.75rem 1.25rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid rgba(225, 48, 108, 0.3)', transition: 'all 0.2s', cursor: 'pointer' }}>
                        <Camera size={18} color="#e1306c" /> Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Resumo */}
            <div>
              <div style={{ background: 'rgba(8, 120, 255, 0.2)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(8, 120, 255, 0.1)', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(8, 120, 255, 0.1)', paddingBottom: '1rem' }}>
                  Resumo da Vaga
                </h3>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Local</span>
                      <span>{vaga.city || 'Não especificado'}{vaga.state ? ` / ${vaga.state}` : ''}</span>
                    </div>
                  </li>
                  
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <Clock size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carga Horária</span>
                      <span>{vaga.workload || 'A combinar'}</span>
                    </div>
                  </li>

                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <GraduationCap size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Escolaridade</span>
                      <span>{vaga.educationLevel || 'Não exigida'}</span>
                    </div>
                  </li>

                  {vaga.salaryVisibility && (
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                      <CheckCircle2 size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Salário</span>
                        <span>
                          {vaga.salaryMin ? `R$ ${vaga.salaryMin}` : ''} {vaga.salaryMax ? `- R$ ${vaga.salaryMax}` : (vaga.salaryMin ? '' : 'A combinar')}
                        </span>
                      </div>
                    </li>
                  )}
                  
                  {vaga.applicationDeadline && (
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                      <CalendarDays size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Encerra em</span>
                        <span>{new Date(vaga.applicationDeadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </li>
                  )}
                </ul>

                <Link href={`/login?redirect=/candidato/vagas/${vaga.id}`} className={styles.btnPrimary} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                  Candidatar-se à Vaga
                </Link>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>
                  Você será redirecionado para acessar sua conta.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
