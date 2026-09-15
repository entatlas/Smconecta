import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Store, MapPin, ExternalLink, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export default async function MarketplaceParceiro({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const parceiro = await prisma.partner.findUnique({
    where: { id: p.id, approvalStatus: 'APPROVED' },
    include: {
      offers: {
        where: { status: 'PUBLISHED' },
        include: { category: true }
      }
    }
  });

  if (!parceiro) {
    notFound();
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '64px' }}>
      {/* Banner / Header */}
      <div style={{ background: '#0f172a', padding: '64px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {parceiro.logoUrl ? (
            <Image src={parceiro.logoUrl} alt={parceiro.name} width={120} height={120} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #334155', margin: '0 auto 24px', background: '#fff', objectFit: 'contain' }} priority />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #334155', margin: '0 auto 24px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700 }}>
              {parceiro.name.charAt(0)}
            </div>
          )}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>{parceiro.name}</h1>
          {parceiro.segment && (
            <span style={{ background: '#334155', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500 }}>
              {parceiro.segment}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-32px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Sobre nós</h2>
            <div style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {parceiro.description || 'Nenhuma descrição informada.'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Contatos</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {parceiro.website && (
                <a href={parceiro.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <ExternalLink size={16} /> Acessar site
                </a>
              )}
              {parceiro.contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.875rem' }}>
                  <Mail size={16} /> {parceiro.contactEmail}
                </div>
              )}
              {parceiro.contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.875rem' }}>
                  <Phone size={16} /> {parceiro.contactPhone}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '48px', marginBottom: '24px' }}>Ofertas Disponíveis ({parceiro.offers.length})</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {parceiro.offers.length === 0 ? (
            <p style={{ color: '#64748b' }}>Este parceiro ainda não possui ofertas publicadas.</p>
          ) : (
            parceiro.offers.map(oferta => (
              <Link key={oferta.id} href={`/marketplace/oferta/${oferta.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', 
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' 
                }}>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                      {oferta.title}
                    </h3>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', marginTop: '16px' }}>
                        {oferta.price ? `R$ ${oferta.price.toFixed(2)}` : 'Sob Consulta'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
