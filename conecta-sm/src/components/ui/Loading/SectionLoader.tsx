import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Loading.module.css';

interface SectionLoaderProps {
  message?: string;
}

export function SectionLoader({ message = 'Carregando...' }: SectionLoaderProps) {
  return (
    <div className={styles.sectionLoaderContainer}>
      <Loader2 size={32} className={styles.spinner} />
      <p style={{ fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}
