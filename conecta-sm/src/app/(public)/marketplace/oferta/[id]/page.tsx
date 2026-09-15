import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Store, MapPin, Tag, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { requestOfferInterest } from '../actions';
import { InterestButton } from './InterestButton'; // Client component

export default async function MarketplaceOferta({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const oferta = await prisma.marketplaceOffer.findUnique({
    where: { id: p.id, status: 'PUBLISHED' },
    include: {
      partner: true,
      category: true
    }
  });

  if (!oferta) {
    notFound();
  }

  // Verifica se o usuario logado ja pediu interesse
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let hasRequested = false;
  let isPartnerOwner = false;

  if (user) {
    const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
    if (profile) {
      if (profile.tipo === 'PARTNER' && oferta.partner.profileId === profile.id) {
        isPartnerOwner = true;
      } else {
        const existingReq = await prisma.marketplaceRequest.findFirst({
          where: { offerId: oferta.id, requesterId: profile.id }
        });
        hasRequested = !!existingReq;
      }
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <Link href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Voltar para o Marketplace
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
          
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {oferta.category && (
                <span style={{ display: 'inline-block', background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                  {oferta.category.name}
                </span>
              )}
              
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.2 }}>
                {oferta.title}
              </h1>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                  <Store size={18} />
                  <Link href={`/marketplace/parceiro/${oferta.partner.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                    {oferta.partner.name}
                  </Link>
                </div>
                {oferta.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <MapPin size={18} /> {oferta.location}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Sobre a oferta</h3>
                <div style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {oferta.description}
                </div>
              </div>

              {oferta.conditions && (
                <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0f172a', fontWeight: 600 }}>
                    <Info size={20} className="text-blue-500" /> Condições Especiais
                  </div>
                  <p style={{ color: '#475569' }}>{oferta.conditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Valor do Investimento</p>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>
                  {oferta.price ? `R$ ${oferta.price.toFixed(2)}` : 'Sob Consulta'}
                </div>
              </div>

              {isPartnerOwner ? (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>
                  Você é o dono desta oferta.
                </div>
              ) : hasRequested ? (
                <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#15803d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={32} />
                  <div>
                    <p style={{ fontWeight: 600 }}>Interesse Enviado!</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>O parceiro entrará em contato em breve.</p>
                  </div>
                </div>
              ) : (
                <InterestButton offerId={oferta.id} />
              )}
              
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Oferecido por:</p>
                <Link href={`/marketplace/parceiro/${oferta.partner.id}`} style={{ textDecoration: 'none' }}>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{oferta.partner.name}</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
