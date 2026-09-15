import { prisma } from '@/lib/prisma';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Briefcase, GraduationCap, Building2, UserCircle, CheckCircle2, MapPin, Clock } from 'lucide-react';
import styles from './page.module.css';
import { CourseCard } from '@/app/candidato/cursos/CourseCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch latest 3 published jobs
  const dbVagas = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { company: true }
  });

  // Fetch latest 3 published courses
  const dbCursos = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const vagas = dbVagas;
  const cursos = dbCursos;

  return (
    <div className={styles.main}>
      
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Desenvolvendo Pessoas. <span className={styles.highlight}>Fortalecendo Empresas.</span></h1>
            <p className={styles.heroSubtitle}>
              O Conecta SM é o ecossistema que une talentos, oportunidades de carreira e soluções corporativas em uma única plataforma de alta performance.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/candidatos" className={styles.btnPrimary}>
                Encontrar oportunidades <ArrowRight size={20} />
              </Link>
              <Link href="/empresas" className={styles.btnSecondary}>
                Sou uma empresa
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <Image 
              src="/sergio_portrait.png" 
              alt="Sergio Mano" 
              width={600} 
              height={600} 
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* TODAS AS PLATAFORMAS (Escolha seu perfil) */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Encontre a plataforma certa para você</h2>
            <p className={styles.sectionSubtitle}>Navegue por nossas soluções de acordo com o seu perfil e objetivo profissional.</p>
          </div>

          <div className={styles.platformsGrid}>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><UserCircle size={32} /></div>
              <h3>Sou Candidato</h3>
              <p>Encontre vagas alinhadas ao seu perfil, desenvolva seu currículo e acompanhe suas oportunidades em tempo real.</p>
              <Link href="/candidatos" className={styles.platformLink}>
                Acessar área do candidato <ArrowRight size={18} />
              </Link>
            </div>

            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Building2 size={32} /></div>
              <h3>Sou Empresa</h3>
              <p>Encontre talentos qualificados, gerencie processos seletivos e aplique soluções estratégicas corporativas.</p>
              <Link href="/empresas" className={styles.platformLink}>
                Acessar área da empresa <ArrowRight size={18} />
              </Link>
            </div>

            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><GraduationCap size={32} /></div>
              <h3>Quero me Desenvolver</h3>
              <p>Acesse nossa grade de formação profissional, com cursos e capacitações exigidas pelas melhores empresas.</p>
              <Link href="/cursos" className={styles.platformLink}>
                Ver cursos <ArrowRight size={18} />
              </Link>
            </div>

            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Briefcase size={32} /></div>
              <h3>Quero Trabalhar na SM</h3>
              <p>Venha fazer parte da equipe SM. Confira nossas oportunidades internas e ajude a transformar carreiras.</p>
              <Link href="/trabalhe-conosco" className={styles.platformLink}>
                Trabalhe Conosco <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUE VISUAL (NOVO) */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.featureSplit}>
            <div className={styles.featureContent}>
              <h2>Conexões que geram <span className={styles.highlight}>Resultados Extraordinários</span></h2>
              <p>Nossa plataforma usa inteligência e design focado no usuário para transformar a maneira como talentos e empresas se encontram. Experimente uma jornada sem atritos e focada no crescimento contínuo.</p>
              <ul className={styles.featureList}>
                <li><CheckCircle2 size={24} className={styles.checkIcon}/> <span>Algoritmos de Match Inteligente</span></li>
                <li><CheckCircle2 size={24} className={styles.checkIcon}/> <span>Trilhas de Evolução de Carreira</span></li>
                <li><CheckCircle2 size={24} className={styles.checkIcon}/> <span>Dashboard Corporativo Completo</span></li>
              </ul>
              <Link href="/cadastro" className={styles.btnPrimary} style={{display: 'inline-block', marginTop: '1rem'}}>Começar Agora</Link>
            </div>
            <div className={styles.featureImage}>
              <Image 
                src="/feature_growth_3d.png" 
                alt="Crescimento e Escala" 
                width={800} 
                height={600} 
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* O QUE É O CONECTA SM */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Conectamos <span className={styles.highlight}>Potencial</span> à <span className={styles.highlight}>Oportunidade</span></h2>
            <p className={styles.sectionSubtitle}>Entenda como o nosso ecossistema acelera o crescimento de empresas e carreiras.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className={styles.glassCard}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Pessoas</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Criação de perfis ricos, exposição às melhores vagas e histórico de empregabilidade centralizado.</p>
            </div>
            <div className={styles.glassCard}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Empresas</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Acesso a milhares de talentos validados, gestão de ATS e triagem estratégica inteligente.</p>
            </div>
            <div className={styles.glassCard}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Desenvolvimento</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Trilhas de formação completas para qualificar quem busca e certificar quem contrata.</p>
            </div>
            <div className={styles.glassCard}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Conexões</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Nosso CRM próprio e agendamento nativo tornam os matches 10x mais rápidos e seguros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VAGAS EM DESTAQUE */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Encontre sua próxima oportunidade</h2>
            <p className={styles.sectionSubtitle}>Confira algumas das vagas mais recentes abertas em nossas empresas parceiras.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {vagas.length > 0 ? vagas.map((vaga) => (
              <Link href={`/vagas/${vaga.id}`} key={vaga.id} className={styles.glassCard} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{vaga.title}</h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(8, 120, 255, 0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{vaga.employmentType}</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '1.5rem' }}>{vaga.company.companyName}</p>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {vaga.city || 'Local não informado'} ({vaga.modality})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {vaga.workload || 'Horário a combinar'}</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {vaga.description}
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginTop: '1.5rem', fontWeight: 600 }}>
                  Ver detalhes <ArrowRight size={16} />
                </span>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>Nenhuma vaga pública encontrada no momento.</div>
            )}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/vagas" className={styles.btnSecondary}>Ver todas as vagas</Link>
          </div>
        </div>
      </section>

      {/* CURSOS EM DESTAQUE */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Desenvolva seu potencial</h2>
            <p className={styles.sectionSubtitle}>Acesse nossa grade de cursos especializados e destaque-se no mercado.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {cursos.length > 0 ? cursos.map((curso) => (
              <CourseCard key={curso.id} course={curso} />
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>Nenhum curso publicado no momento.</div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/cursos" className={styles.btnPrimary}>Ver todos os cursos</Link>
          </div>
        </div>
      </section>

      {/* CTA CENTRAL FINAL */}
      <section className={styles.section} style={{ textAlign: 'center', padding: '8rem 0' }}>
        <div className={styles.container}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '2rem' }}>Sua trajetória de sucesso <br/>começa com a SM.</h2>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/cadastro" className={styles.btnPrimary} style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
              Criar minha conta gratuita
            </Link>
            <Link href="/contato" className={styles.btnSecondary} style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
              Falar com um Consultor SM
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
