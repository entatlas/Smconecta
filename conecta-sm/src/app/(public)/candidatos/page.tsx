'use client';

import React from 'react';
import Link from 'next/link';
import { UserCircle, CheckCircle2, TrendingUp, BookOpen, Star } from 'lucide-react';
import styles from '../page.module.css';

export default function Candidatos() {
  return (
    <div className={styles.main}>
      <section className={styles.hero} style={{ minHeight: '60vh', paddingTop: '120px' }}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent} style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className={styles.heroText}>
            <h1>Área do <span className={styles.highlight}>Candidato</span></h1>
            <p className={styles.heroSubtitle} style={{ margin: '0 auto' }}>
              Muito mais que vagas. Um ecossistema completo para acelerar o seu desenvolvimento e conectar você às melhores empresas.
            </p>
            <div className={styles.heroButtons} style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <Link href="/cadastro" className={styles.btnPrimary}>Criar Perfil Gratuito</Link>
              <Link href="/vagas" className={styles.btnSecondary}>Ver Vagas Abertas</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Por que fazer parte da SM?</h2>
          </div>
          
          <div className={styles.platformsGrid}>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><Star size={32} /></div>
              <h3>Banco de Talentos Exclusivo</h3>
              <p>Seu perfil fica visível para as maiores empresas da região. Muitas vagas são preenchidas diretamente pelo nosso banco antes mesmo de irem a público.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><BookOpen size={32} /></div>
              <h3>Cursos e Certificações</h3>
              <p>Acesse treinamentos comportamentais e técnicos exigidos pelo mercado. Cada curso concluído vira um selo automático no seu currículo.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><TrendingUp size={32} /></div>
              <h3>Trilhas de Carreira</h3>
              <p>Acompanhe sua evolução e receba sugestões inteligentes de como melhorar seu perfil para as vagas que você almeja.</p>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon}><UserCircle size={32} /></div>
              <h3>CRM do Candidato</h3>
              <p>Chega de enviar currículo e não ter resposta. Acompanhe o status de cada candidatura e centralize suas entrevistas via Agenda SM.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
