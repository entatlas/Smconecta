import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Clock, GraduationCap, MapPin, CheckCircle2, MonitorPlay, Users } from 'lucide-react';
import Image from 'next/image';
import styles from '../../page.module.css';

export default async function CursoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let curso = await prisma.course.findUnique({
    where: { id: id },
    include: {
      instructor: true,
      inspiringStories: {
        where: { status: 'PUBLISHED' }
      }
    }
  });

  if (!curso || curso.status !== 'PUBLISHED') {
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
                {curso.level}
              </span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(8, 120, 255, 0.1)', color: 'var(--color-text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {curso.modality}
              </span>
            </div>
            <h1>{curso.title}</h1>
            <p className={styles.heroSubtitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginTop: '1rem' }}>
              <Users size={20} /> Instrutor: {curso.instructor?.nome || "Conecta SM Academy"}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            {/* Detalhes Principais */}
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>
                Sobre o Curso
              </h2>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
                {curso.longDescription || curso.description}
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(8, 120, 255, 0.2)', padding: '1.5rem', borderRadius: '12px', flex: 1 }}>
                   <MonitorPlay size={32} color="var(--color-primary)" />
                   <div>
                     <h4 style={{ color: 'var(--color-text-primary)', margin: 0 }}>Conteúdo Rico</h4>
                     <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>Aulas práticas e teóricas</p>
                   </div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(8, 120, 255, 0.2)', padding: '1.5rem', borderRadius: '12px', flex: 1 }}>
                   <CheckCircle2 size={32} color="var(--color-primary)" />
                   <div>
                     <h4 style={{ color: 'var(--color-text-primary)', margin: 0 }}>Certificação</h4>
                     <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>Válido em todo o país</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Histórias que Inspiram */}
            {curso.inspiringStories && curso.inspiringStories.length > 0 && (
              <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>
                  Histórias que Inspiram
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {curso.inspiringStories.map((story: any) => (
                    <Link href={`/historias/${story.id}`} key={story.id} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' }} className="hover:-translate-y-1 hover:border-blue-500/30 group">
                      <div style={{ height: '120px', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                         {story.coverUrl ? (
                           <Image src={story.coverUrl} alt={story.name} fill style={{ objectFit: 'cover' }} />
                         ) : (
                           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              <CheckCircle2 size={32} />
                           </div>
                         )}
                      </div>
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h4 style={{ color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{story.name}</h4>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>{story.profession}</p>
                        <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 500, marginTop: 'auto' }}>Ler história &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar / Resumo */}
            <div>
              <div style={{ background: 'rgba(8, 120, 255, 0.2)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(8, 120, 255, 0.1)', position: 'sticky', top: '100px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(8, 120, 255, 0.1)' }}>
                  <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: curso.isFree ? '#10b981' : 'var(--color-text-primary)' }}>
                    {curso.isFree ? 'Gratuito' : `R$ ${curso.price?.toFixed(2)}`}
                  </span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <Clock size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Carga Horária</span>
                      <span>{curso.workloadHours} horas</span>
                    </div>
                  </li>

                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Modalidade</span>
                      <span>{curso.modality}</span>
                    </div>
                  </li>

                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                    <GraduationCap size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Idioma</span>
                      <span>{curso.language}</span>
                    </div>
                  </li>
                </ul>

                <Link href={`/login?redirect=/candidato/cursos/${curso.id}`} className={styles.btnPrimary} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                  Matricular-se
                </Link>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                  É necessário estar logado para se matricular.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
