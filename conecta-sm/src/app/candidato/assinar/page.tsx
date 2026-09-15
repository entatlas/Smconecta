import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function AssinarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });

  const candidate = await prisma.candidate.findFirst({
    where: { profile: { auth_user_id: user.id } },
    include: { subscription: { include: { plan: true } } }
  });

  const isBlocked = candidate?.subscriptionStatus === 'CANCELED' || candidate?.subscriptionStatus === 'PAUSED';
  const hasActiveSub = candidate?.subscriptionStatus === 'ACTIVE' && candidate.subscription;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {hasActiveSub && candidate.subscription ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '2rem', borderRadius: '12px', marginBottom: '3rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#064e3b', marginBottom: '0.5rem' }}>
            Sua assinatura atual: {candidate.subscription.plan.name}
          </h2>
          <p style={{ color: '#047857' }}>
            Renovação programada para: {candidate.subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
          </p>
        </div>
      ) : isBlocked ? (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', padding: '2rem', borderRadius: '12px', marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.5rem' }}>
            Assinatura Inativa
          </h2>
          <p style={{ color: '#7f1d1d' }}>
            Escolha um dos planos abaixo para reativar seu acesso e voltar a usar a plataforma.
          </p>
        </div>
      ) : null}

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
          {hasActiveSub ? 'Fazer Upgrade de Plano' : 'Escolha o Plano Ideal para Sua Carreira'}
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
          Desbloqueie ferramentas avançadas e destaque-se para milhares de empresas.
        </p>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '8px' }}>
          <p>Nenhum plano disponível no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {plans.map((plan) => {
            const features = plan.features ? JSON.parse(plan.features) : [];
            
            return (
              <div 
                key={plan.id}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '2rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.name.toLowerCase().includes('premium') ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  position: 'relative'
                }}
              >
                {plan.name.toLowerCase().includes('premium') && (
                  <span style={{ 
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '999px',
                    fontSize: '0.875rem', fontWeight: 'bold'
                  }}>
                    Mais Popular
                  </span>
                )}
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>{plan.name}</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', minHeight: '48px' }}>{plan.description}</p>
                
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>/{plan.interval === 'MONTHLY' ? 'mês' : 'ano'}</span>
                </div>
                
                <ul style={{ flex: 1, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: '#334155' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Por enquanto, como não temos a API, faremos uma Action para simular a assinatura */}
                <form action={async () => {
                  'use server';
                  // Aqui depois chamaremos o Checkout do Stripe/Pagar.me
                  console.log("Simulando checkout para plano:", plan.name);
                }}>
                  <Button type="submit" style={{ width: '100%', height: '3rem' }}>
                    Assinar Agora
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
