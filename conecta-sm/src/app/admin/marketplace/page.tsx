import React from 'react';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { Store, Package, CheckSquare, List } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminMarketplaceDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') redirect('/acesso-negado');

  // Mock data as Prisma models Partner, MarketplaceOffer, MarketplaceRequest are not yet created
  const [parceiros, ofertas, pendentes, solicitacoes] = [0, 0, 0, 0];

  const cards = [
    { title: 'Total de Parceiros', value: parceiros, icon: Store, color: '#3b82f6', link: '/admin/marketplace/parceiros' },
    { title: 'Ofertas Totais', value: ofertas, icon: Package, color: '#8b5cf6', link: '/admin/marketplace/ofertas' },
    { title: 'Ofertas Pendentes', value: pendentes, icon: CheckSquare, color: '#f59e0b', link: '/admin/marketplace/ofertas' },
    { title: 'Total Solicitações', value: solicitacoes, icon: List, color: '#10b981', link: '#' }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a' }}>Gestão do Marketplace</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Visão geral do ecossistema de parceiros e aprovações.
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {cards.map((card, i) => (
          <Link key={i} href={card.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${card.color}15`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <card.icon size={24} />
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
                  {card.title}
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {card.value}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Atalhos Rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/admin/marketplace/parceiros" style={{ display: 'block', padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#334155', fontWeight: 500 }}>
              Moderação de Parceiros
            </Link>
            <Link href="/admin/marketplace/ofertas" style={{ display: 'block', padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#334155', fontWeight: 500 }}>
              Aprovação de Ofertas
            </Link>
            <Link href="/admin/marketplace/categorias" style={{ display: 'block', padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#334155', fontWeight: 500 }}>
              Gestão de Categorias
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
