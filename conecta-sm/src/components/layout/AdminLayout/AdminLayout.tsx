'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { AdminHeader } from './AdminHeader';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <AdminHeader />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};
