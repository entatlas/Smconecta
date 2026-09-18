'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Menu, X, LayoutDashboard, Users, Briefcase, Calendar, Building2, Settings, Bell, LogOut, CreditCard, ChevronDown, User, Sun, Moon, Globe, LifeBuoy } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTranslation } from '@/contexts/I18nContext';
import { useTheme } from '../../providers/ThemeProvider';

const menuItems = [
  {
    sectionKey: 'sidebar.principal',
    items: [
      { nameKey: 'sidebar.dashboard', href: '/empresa/dashboard', icon: LayoutDashboard, enabled: true },
      { nameKey: 'sidebar.myJobs', href: '/empresa/vagas', icon: Briefcase, enabled: true },
      { nameKey: 'sidebar.createJob', href: '/empresa/vagas/nova', icon: Briefcase, enabled: true },
      { nameKey: 'sidebar.applications', href: '/empresa/candidaturas', icon: Users, enabled: true },
      { nameKey: 'sidebar.candidates', href: '/empresa/candidatos', icon: Users, enabled: true },
      { nameKey: 'sidebar.agenda', href: '/empresa/agenda', icon: Calendar, enabled: true },
    ]
  },
  {
    sectionKey: 'sidebar.company',
    items: [
      { nameKey: 'sidebar.companyProfile', href: '/empresa/perfil', icon: Building2, enabled: true },
      { nameKey: 'Assinatura', href: '/empresa/assinatura', icon: CreditCard, enabled: true },
      { nameKey: 'sidebar.settings', href: '/empresa/configuracoes', icon: Settings, enabled: true },
    ]
  },
  {
    sectionKey: 'sidebar.communication',
    items: [
      { nameKey: 'sidebar.notifications', href: '/empresa/notificacoes', icon: Bell, enabled: true },
      { nameKey: 'Suporte', href: '/empresa/suporte', icon: LifeBuoy, enabled: true },
    ]
  }
];

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CompanySidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Empresa');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? '');
        setUserName(
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Empresa'
        );
        const { data } = await supabase.from('profiles').select('avatar_url, nome').eq('auth_user_id', user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        if (data?.nome) setUserName(data.nome);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <button className={styles.hamburger} onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={() => setIsOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={64} style={{ height: '64px', width: '100%', objectFit: 'contain', objectPosition: 'left', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} priority />
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

      <nav className={styles.nav}>
        {menuItems.map((section, idx) => (
          <div key={idx} className={styles.section}>
            <span className={styles.sectionTitle}>{t(section.sectionKey)}</span>
            <ul className={styles.list}>
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isMinhasVagasException = item.href === '/empresa/vagas' && pathname.startsWith('/empresa/vagas/nova');
                const isActive = (pathname === item.href || pathname.startsWith(item.href + '/')) && !isMinhasVagasException;

                return (
                  <li key={itemIdx}>
                    {item.enabled ? (
                      <Link 
                        href={item.href}
                        prefetch={false}
                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={20} />
                        <span>{item.nameKey.includes('.') ? t(item.nameKey) : item.nameKey}</span>
                      </Link>
                    ) : (
                      <div className={`${styles.link} ${styles.disabled}`}>
                        <Icon size={20} />
                        <span>{t(item.nameKey)}</span>
                        <span className={styles.badge}>Em breve</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div ref={userMenuRef}>
          {userMenuOpen && (
            <div className={styles.userDropdown}>
              <Link href="/empresa/perfil" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }}>
                <User size={14} /> Minha Conta
              </Link>
              <Link href="/empresa/configuracoes" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }}>
                <Settings size={14} /> Configurações
              </Link>
              <Link href="/" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }}>
                <Globe size={14} /> Ir para o site
              </Link>

              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                <LogOut size={14} /> {t('sidebar.logout')}
              </button>
            </div>
          )}
          <button
            className={styles.userCard}
            onClick={() => setUserMenuOpen(v => !v)}
            aria-expanded={userMenuOpen}
          >
            <div className={styles.userAvatar}>
              {avatarUrl ? <Image src={avatarUrl} alt="Avatar" fill style={{ objectFit: 'cover' }} /> : getInitials(userName)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userEmail}>{userEmail}</span>
            </div>
            <ChevronDown
              size={14}
              className={`${styles.userChevron} ${userMenuOpen ? styles.userChevronOpen : ''}`}
            />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
