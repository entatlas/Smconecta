'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Crosshair, Network, Compass } from 'lucide-react';
import styles from '../page.module.css';

export default function Solucoes() {
  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '60vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Portfólio de <span className={styles.highlight}>Soluções SM</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Desde o recrutamento preciso até a capacitação contínua. Descubra como a SM pode elevar o nível da sua organização.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          
          <div className={styles.platformsGrid}>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Crosshair size={32} /></div>
              <h3>R&S - Recrutamento e Seleção</h3>
              <p>Mapeamento de perfil, testes práticos e psicológicos, e entrega de candidatos validados no prazo acordado.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Briefcase size={32} /></div>
              <h3>Hunting Executivo</h3>
              <p>Busca ativa e sigilosa por posições de liderança e especialistas, utilizando nossa rede de networking nacional e ferramentas avançadas.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Compass size={32} /></div>
              <h3>Treinamentos In Company</h3>
              <p>Capacitação presencial ou online focada nas dores reais da sua equipe. Liderança, Vendas, Atendimento, Inteligência Emocional, etc.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Network size={32} /></div>
              <h3>Software Conecta SM (ATS/CRM)</h3>
              <p>Licenciamento da nossa plataforma para uso interno do seu RH. Digitalize seus processos e ganhe agilidade na gestão de candidatos.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link href="/contato" className={styles.btnPrimary}>Solicitar Proposta</Link>
          </div>

        </div>
      </section>

    </div>
  );
}
