'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Heart,
  User,
  GraduationCap,
  Award,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Crown,
  MessageCircle
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { createClient } from '@/utils/supabase/client';

const menuItems = [
  {
    section: 'Principal',
    items: [
      { name: 'Dashboard', href: '/candidato/dashboard', icon: LayoutDashboard },
      { name: 'Encontrar Vagas', href: '/candidato/vagas', icon: Briefcase },
      { name: 'Minhas Candidaturas', href: '/candidato/candidaturas', icon: FileText },
      { name: 'Vagas Salvas', href: '/candidato/vagas-salvas', icon: Heart },
    ]
  },
  {
    section: 'Meu Perfil',
    items: [
      { name: 'Meu Perfil', href: '/candidato/perfil', icon: User },
      { name: 'Cursos', href: '/candidato/cursos', icon: GraduationCap },
      { name: 'Assinatura', href: '/planos', icon: Crown },
    ]
  },
  {
    section: 'Comunicação',
    items: [
      { name: 'Agenda', href: '/candidato/agenda', icon: Calendar },
      { name: 'Notificações', href: '/candidato/notificacoes', icon: Bell },
      { name: 'Configurações', href: '/candidato/configuracoes', icon: Settings },
      { name: 'Suporte Atlas', href: '/candidato/suporte', icon: MessageCircle },
    ]
  }
];

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CandidateSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userName, setUserName] = useState('Candidato');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? '');
        setUserName(
          user.user_metadata?.nome ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Candidato'
        );
        const { data } = await supabase.from('profiles').select('avatar_url').eq('auth_user_id', user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    });
  }, []);

  // Close user menu on outside click
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
      <button 
        className={styles.hamburger} 
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={64} style={{ height: '64px', width: '100%', objectFit: 'contain', objectPosition: 'left', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} priority />
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((section, idx) => (
            <div key={idx} className={styles.section}>
              <span className={styles.sectionTitle}>{section.section}</span>
              <ul className={styles.list}>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={itemIdx}>
                      <Link 
                        href={item.href}
                        prefetch={false}
                        className={`${styles.link} ${isActive ? styles.active : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={20} className={styles.linkIcon} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Footer Dropdown (Mesmo visual do admin) */}
        <div className={styles.footer}>
          <div ref={userMenuRef}>
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

            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <Link href="/candidato/perfil" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                  <User size={14} /> Minha Conta
                </Link>
                <Link href="/candidato/configuracoes" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                  <Settings size={14} /> Configurações
                </Link>
                
                <div className={styles.dropdownDivider} />
                
                <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                  <LogOut size={14} /> Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
