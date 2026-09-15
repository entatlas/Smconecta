import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import styles from '../page.module.css';
import { CourseCard } from '@/app/candidato/cursos/CourseCard';

export default async function CursosList() {
  const dbCursos = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' }
  });
  
  const cursos = dbCursos;

  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Cursos e <span className={styles.highlight}>Capacitações</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Desenvolva as habilidades que o mercado procura e destaque seu currículo.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {cursos.length > 0 ? cursos.map((curso) => (
              <CourseCard key={curso.id} course={curso} />
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(8, 120, 255, 0.1)', borderRadius: '16px' }}>
                <Search size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Trilhas em Estruturação</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Estamos montando o catálogo de capacitações com parceiros de alto nível. Fique de olho nesta área para alavancar seu perfil em futuras oportunidades.</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}

