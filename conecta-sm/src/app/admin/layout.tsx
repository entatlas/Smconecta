import { AdminLayout } from '@/components/layout/AdminLayout/AdminLayout';
import React from 'react';
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
