import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from '../page.module.css';

export const metadata = {
  title: 'Sobre a SM | Conecta SM',
  description: 'Conheça a história e o propósito da SM Soluções e Treinamentos.',
};

export default function Sobre() {
  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '60vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Sobre a <span className={styles.highlight}>SM Soluções & Treinamentos</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Mais de uma década desenvolvendo profissionais e transformando empresas através de qualificação e processos assertivos.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.featureSplit}>
            <div className={styles.featureContent}>
              <h2 style={{ color: '#00E5FF', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nossa História</h2>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Nascemos para resolver o apagão de talentos.</h2>
              <p>A SM começou como uma resposta a uma dor latente no mercado corporativo: a dificuldade de encontrar, treinar e reter talentos com as competências reais exigidas pelas empresas.</p>
              <p>Comandada por Sérgio Mano, especialista em desenvolvimento humano, a SM consolidou-se como a principal ponte entre profissionais que buscam crescimento e organizações que buscam resultados acima da média.</p>
            </div>
            <div className={styles.featureImage} style={{ background: '#0f172a', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                src="/sergio_portrait.png" 
                alt="Sergio Mano" 
                width={500} 
                height={500} 
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nosso Propósito</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#00E5FF', marginBottom: '1rem' }}>Missão</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Qualificar profissionais e otimizar processos corporativos, entregando perfis perfeitamente alinhados à cultura e necessidade de cada negócio.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#00E5FF', marginBottom: '1rem' }}>Visão</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Ser o maior ecossistema de empregabilidade e desenvolvimento corporativo da região, reconhecida por resultados extraordinários.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#00E5FF', marginBottom: '1rem' }}>Valores</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Alta Performance, Disciplina, Ética Profissional, Resultado e Relacionamento de Longo Prazo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className={styles.container}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>Conheça nossas soluções na prática</h2>
          <Link href="/solucoes" className={styles.btnPrimary}>
            Ver portfólio de soluções
          </Link>
        </div>
      </section>
    </div>
  );
}
