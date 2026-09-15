'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, CheckCircle2, Target, Users, Zap } from 'lucide-react';
import styles from '../page.module.css';

export default function Empresas() {
  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '60vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Soluções para <span className={styles.highlight}>Empresas</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Encontre os melhores talentos, automatize seu recrutamento e eleve o nível da sua equipe com nossos treinamentos In Company.
            </p>
            <div className={styles.heroButtons} style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <Link href="/contato" className={styles.btnPrimary}>Falar com Especialista</Link>
              <Link href="/solucoes" className={styles.btnSecondary}>Conhecer Soluções</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.featureSplit}>
            <div className={styles.featureImage} style={{ position: 'relative', height: '400px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                src="/hero_3d_neon.png" 
                alt="Plataforma ATS" 
                fill 
                className="object-cover"
                style={{ opacity: 0.85, filter: 'hue-rotate(10deg) saturate(1.2)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--color-bg-sidebar) 100%)', opacity: 0.8 }} />
              
              {/* Glassmorphism Logo Container */}
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', padding: '2rem 3rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <Image src="/sm_logo.png" alt="SM Logo" width={160} height={60} style={{ objectFit: 'contain', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' }} />
                <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', margin: '0.5rem 0' }} />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Smart ATS Plataform</span>
              </div>
            </div>
            <div className={styles.featureContent}>
              <h2 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Recrutamento Ágil</h2>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>O fim das contratações erradas.</h2>
              <p>Com o Conecta SM, você não apenas anuncia vagas, você acessa um pool de talentos já validados, certificados e ranqueados por aderência cultural (Fit Cultural) e técnica.</p>
              
              <ul className={styles.featureList}>
                <li><CheckCircle2 className={styles.checkIcon} size={20} /> Match Inteligente de Competências</li>
                <li><CheckCircle2 className={styles.checkIcon} size={20} /> Funil de Recrutamento Kanban integrado</li>
                <li><CheckCircle2 className={styles.checkIcon} size={20} /> Agendamento nativo de entrevistas</li>
                <li><CheckCircle2 className={styles.checkIcon} size={20} /> Testes Comportamentais online</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
