'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Lock } from 'lucide-react';

interface PaywallWrapperProps {
  children: React.ReactNode;
  status: string;
}

export function PaywallWrapper({ children, status }: PaywallWrapperProps) {
  const pathname = usePathname();
  
  // Se for a página de assinatura em si, sempre mostra normal (senão ele não consegue assinar)
  if (pathname === '/candidato/assinar') {
    return <>{children}</>;
  }

  // Se a assinatura está cancelada ou pausada, bloqueia o painel visualmente
  const isBlocked = status === 'CANCELED' || status === 'PAUSED';

  if (isBlocked) {
    return (
      <div style={{ position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Conteúdo "embaçado" ou inativo por baixo */}
        <div style={{ filter: 'blur(8px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none', flex: 1 }}>
          {children}
        </div>
        
        {/* Overlay de Bloqueio por cima */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)', zIndex: 50, padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px' }}>
            <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Lock size={32} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Assinatura Inativa
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Seu painel está bloqueado pois não identificamos uma assinatura ativa. Para continuar aproveitando todas as oportunidades da plataforma, reative seu plano.
            </p>
            <Link href="/candidato/assinar">
              <Button style={{ width: '100%', height: '3rem', fontSize: '1.1rem' }}>
                Ver Planos e Assinar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Se tiver ativo ou em trial/tolerância, renderiza o dashboard normalmente
  return <>{children}</>;
}
