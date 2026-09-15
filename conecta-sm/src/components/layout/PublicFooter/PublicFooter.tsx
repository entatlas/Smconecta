'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PublicFooter.module.css';

export const PublicFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Image src="/sm_logo.png" alt="SM Conecta Logo" width={150} height={40} style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p className={styles.description}>
              O ecossistema definitivo que conecta pessoas, empresas, desenvolvimento profissional e grandes oportunidades.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a href="https://www.instagram.com/sergiomano_?igsh=d216Z2Z6eTlpdjRz" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#00E5FF'} onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://br.linkedin.com/in/s%C3%A9rgio-mano-2a8927170" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#00E5FF'} onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://wa.me/5511995721209?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20solu%C3%A7%C3%B5es%20de%20treinamento%20e%20qualifica%C3%A7%C3%A3o%20da%20SM%20Solu%C3%A7%C3%B5es%20%26%20Treinamentos.%20Poderia%20me%20ajudar%3F" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#00E5FF'} onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Conecta SM</h4>
            <ul>
              <li><Link href="/sobre">Sobre a SM</Link></li>
              <li><Link href="/solucoes">Soluções Corporativas</Link></li>
              <li><Link href="/contato">Contato</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Para Pessoas</h4>
            <ul>
              <li><Link href="/vagas">Vagas Abertas</Link></li>
              <li><Link href="/candidatos">Banco de Talentos</Link></li>
              <li><Link href="/cursos">Cursos e Trilhas</Link></li>
              <li><Link href="/trabalhe-conosco">Trabalhe Conosco (SM)</Link></li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Para Empresas</h4>
            <ul>
              <li><Link href="/solucoes">Nossas Soluções</Link></li>
              <li><Link href="/empresas">Encontrar Talentos</Link></li>
              <li><Link href="/cadastro">Publicar uma Vaga</Link></li>
            </ul>
          </div>
          
        </div>

        <div className={styles.bottomBar}>
          <p>&copy; {new Date().getFullYear()} SM Soluções & Treinamentos. Todos os direitos reservados.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacidade">Política de Privacidade</Link>
            <Link href="/termos">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
