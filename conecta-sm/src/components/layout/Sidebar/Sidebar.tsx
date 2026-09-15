'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  LineChart,
  PieChart,
  FileBarChart,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  LayoutGrid,
  CheckSquare,
  Bot,
  Activity,
  ShieldAlert,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
  X,
  Menu,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTheme } from '../../providers/ThemeProvider';
import styles from './Sidebar.module.css';

// ─── Menu Structure ──────────────────────────────────────────
const MENU = [
  {
    section: 'Principal',
    items: [
      { name: 'Dashboard',   href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Agenda Geral', href: '/admin/agenda',   icon: Calendar },
    ],
  },
  {
    section: 'Inteligência / Mercado',
    items: [
      { name: 'Visão de Mercado',  href: '/admin/inteligencia-de-mercado', icon: LineChart },
      { name: 'Dashboard BI',      href: '/admin/bi',                      icon: PieChart },
      { name: 'Relatórios Gerais', href: '/admin/relatorios',              icon: FileBarChart },
    ],
  },
  {
    section: 'Pessoas',
    items: [
      { name: 'Candidatos', href: '/admin/candidatos', icon: Users },
      { name: 'Empresas',   href: '/admin/empresas',   icon: Building2 },
    ],
  },
  {
    section: 'Empregabilidade',
    items: [
      { name: 'Vagas', href: '/admin/vagas', icon: Briefcase },
      { name: 'Candidaturas', href: '/admin/candidaturas', icon: CheckSquare },
      { name: 'Candidaturas SM', href: '/admin/candidaturas-sm', icon: CheckSquare },
      { name: 'Vitrine de Cursos', href: '/admin/cursos', icon: GraduationCap },
    ],
  },
  {
    section: 'Eventos',
    items: [
      { name: 'Eventos', href: '/admin/eventos', icon: Calendar },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { name: 'Monitoramento', href: '/admin/monitoramento', icon: Activity },
      { name: 'Auditoria',     href: '/admin/auditoria',     icon: ShieldAlert },
      { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
      { name: 'Templates de E-mail', href: '/admin/configuracoes/emails', icon: Mail },
      { name: 'Suporte Atlas', href: '/admin/suporte', icon: MessageCircle },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────
export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Administrador');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user info
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? '');
        setUserName(
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Administrador'
        );
        const { data } = await supabase.from('profiles').select('avatar_url').eq('auth_user_id', user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    load();
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'));

  return (
    <>
      {/* ── Hamburger (mobile) ── */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Overlay (mobile) ── */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>

        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/sm_logo.png" alt="SM Logo" width={150} height={64} style={{ height: '64px', width: '100%', objectFit: 'contain', objectPosition: 'left', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} priority />
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {MENU.map((section) => (
            <div key={section.section} className={styles.section}>
              <span className={styles.sectionTitle}>{section.section}</span>
              <ul className={styles.list}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className={`${styles.link} ${active ? styles.active : ''}`}
                      >
                        <Icon size={17} className={styles.linkIcon} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Footer */}
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
                <button className={styles.dropdownItem}>
                  <User size={14} /> Minha Conta
                </button>
                <Link href="/admin/configuracoes" prefetch={false} className={styles.dropdownItem} style={{ textDecoration: 'none' }}>
                  <Settings size={14} /> Configurações
                </Link>
                <button className={styles.dropdownItem} onClick={toggleTheme}>
                  {theme === 'light'
                    ? <><Moon size={14} /> Modo Escuro</>
                    : <><Sun size={14} /> Modo Claro</>
                  }
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={handleLogout}
                >
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
