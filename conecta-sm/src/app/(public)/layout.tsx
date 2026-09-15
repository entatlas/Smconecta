import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter/PublicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#040b16', minHeight: '100vh', color: '#f0f4f8', fontFamily: 'var(--font-geist-sans)' }}>
      <PublicHeader />
      <main>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
