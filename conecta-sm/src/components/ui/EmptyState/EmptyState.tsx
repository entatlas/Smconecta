import React from 'react';
import { FileSearch } from 'lucide-react';
import { Button } from '../Button/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon = <FileSearch size={48} style={{ opacity: 0.3 }} />, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      color: 'var(--color-text-primary)'
    }}>
      <div style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
