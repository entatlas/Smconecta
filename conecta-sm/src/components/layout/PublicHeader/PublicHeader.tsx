'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Home, Info, Briefcase, User, Building2, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { createClient } from '@/utils/supabase/client';
import styles from './PublicHeader.module.css';

export const PublicHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navItems = [
    { name: 'Início', url: '/', icon: Home },
    { name: 'Sobre', url: '/sobre', icon: Info },
    { name: 'Soluções', url: '/solucoes', icon: Briefcase },
    { name: 'Para Candidatos', url: '/candidatos', icon: User },
    { name: 'Para Empresas', url: '/empresas', icon: Building2 },
    { name: 'Cursos', url: '/cursos', icon: GraduationCap },
    { name: 'Trabalhe Conosco', url: '/trabalhe-conosco', icon: Users },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsLoggedIn(true);
    };
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              <Image src="/sm_logo.png" alt="SM Conecta Logo" width={150} height={40} style={{ height: '40px', width: 'auto', objectFit: 'contain' }} priority />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav}>
            <div className={styles.centerNavWrapper}>
              <NavBar items={navItems} />
            </div>

            <div className={styles.authButtons}>
              <a href="https://sergiomano.com.br" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={styles.loginButton} style={{ borderColor: 'rgba(255, 255, 255, 0.2)', background: 'transparent' }}>Conheça a SM</Button>
              </a>
              {isLoggedIn ? (
                <Link href="/redirect-dashboard">
                  <Button className={styles.loginButton}>Meu Painel</Button>
                </Link>
              ) : (
                <>
                  <Link href="/cadastro">
                    <span className={styles.createAccount}>Criar minha conta</span>
                  </Link>
                  <Link href="/login">
                    <Button className={styles.loginButton}>Entrar na Plataforma</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className={styles.mobileBottomNav}>
        <div className={styles.bottomNavContainer}>
          <Link href="/" className={`${styles.bottomNavItem} ${styles.activeBottomItem}`}>
            <Home size={22} />
            <span>Início</span>
          </Link>
          <Link href="/solucoes" className={styles.bottomNavItem}>
            <Briefcase size={22} />
            <span>Serviços</span>
          </Link>
          <Link href="/candidatos" className={styles.bottomNavItem}>
            <User size={22} />
            <span>Candidatos</span>
          </Link>
          <button className={styles.bottomNavItem} onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Full Screen Menu Overlay */}
      {mobileMenuOpen && (
        <div className={styles.fullScreenMenu}>
          <div className={styles.fullScreenMenuHeader}>
            <h2>Menu</h2>
            <button onClick={() => setMobileMenuOpen(false)} className={styles.closeMenuBtn}>
              <X size={24} />
            </button>
          </div>
          
          <div className={styles.fullScreenMenuContent}>
            <div className={styles.menuGroup}>
              <span className={styles.menuGroupTitle}>PRINCIPAL</span>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Início</Link>
              <Link href="/sobre" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Sobre a SM</Link>
              <Link href="/solucoes" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Soluções</Link>
            </div>
            
            <div className={styles.menuGroup}>
              <span className={styles.menuGroupTitle}>PÚBLICO</span>
              <Link href="/candidatos" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Para Candidatos</Link>
              <Link href="/empresas" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Para Empresas</Link>
              <Link href="/cursos" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Cursos</Link>
              <Link href="/trabalhe-conosco" onClick={() => setMobileMenuOpen(false)} className={styles.fullScreenLink}>Trabalhe Conosco</Link>
            </div>
          </div>

          <div className={styles.fullScreenMenuFooter}>
            {isLoggedIn ? (
              <Link href="/redirect-dashboard" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%' }}>
                <Button className={styles.loginButtonFull}>Meu Painel</Button>
              </Link>
            ) : (
              <>
                <Link href="/cadastro" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%' }}>
                  <Button variant="outline" className={styles.loginButtonOutlineFull}>Criar minha conta</Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%' }}>
                  <Button className={styles.loginButtonFull}>Entrar na Plataforma</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
