'use client'

import React, { useState, useEffect } from 'react'
import { LucideIcon, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface NoticeBannerProps {
  title: string;
  description: React.ReactNode;
  icon: LucideIcon;
  type?: 'info' | 'warning' | 'error' | 'success';
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    loading?: boolean;
    icon?: LucideIcon;
  };
  className?: string;
}

export function NoticeBanner({ title, description, icon: Icon, type = 'info', action, className }: NoticeBannerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const styles = {
    info: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
      desc: 'text-blue-800/80 dark:text-blue-200/80',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/40'
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-900 dark:text-amber-100',
      desc: 'text-amber-800/80 dark:text-amber-200/80',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 hover:shadow-amber-500/40'
    },
    error: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-900/50',
      iconBg: 'bg-rose-100 dark:bg-rose-900',
      iconColor: 'text-rose-600 dark:text-rose-400',
      title: 'text-rose-900 dark:text-rose-100',
      desc: 'text-rose-800/80 dark:text-rose-200/80',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 hover:shadow-rose-500/40'
    },
    success: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'text-emerald-900 dark:text-emerald-100',
      desc: 'text-emerald-800/80 dark:text-emerald-200/80',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
    }
  }

  const s = styles[type];
  const ActionIcon = action?.icon || ArrowRight;

  const buttonContent = (
    <>
      {action?.loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ActionIcon className="mr-2 h-4 w-4" />
      )}
      {action?.loading ? 'Processando...' : action?.label}
    </>
  )

  const buttonClass = cn(
    "inline-flex w-full md:w-auto items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5",
    s.btn,
    action?.loading && "opacity-70 pointer-events-none"
  )

  return (
    <div className={cn(
      "w-full rounded-xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-opacity duration-500 backdrop-blur-sm",
      s.bg, s.border,
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      className
    )}>
      <div className="flex items-start gap-4 flex-1">
        <div className={cn("p-2.5 rounded-full flex-shrink-0 mt-0.5 shadow-inner", s.iconBg, s.iconColor)}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className={cn("font-bold text-[15px] tracking-tight", s.title)}>{title}</h3>
          <div className={cn("text-sm leading-relaxed", s.desc)}>
            {description}
          </div>
        </div>
      </div>
      
      {action && (
        <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
          {action.href ? (
            <Link href={action.href} className={buttonClass}>
              {buttonContent}
            </Link>
          ) : (
            <button onClick={action.onClick} disabled={action.loading} className={buttonClass}>
              {buttonContent}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
