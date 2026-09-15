import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Search, Store, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = searchParams?.q as string;
  const categoryId = searchParams?.categoria as string;

  const whereClause: any = { status: 'PUBLISHED' };
  
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { partner: { name: { contains: query, mode: 'insensitive' } } }
    ];
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const [ofertas, categorias] = await Promise.all([
    prisma.marketplaceOffer.findMany({
      where: whereClause,
      include: {
        partner: { select: { id: true, name: true, logoUrl: true } },
        category: { select: { name: true } }
      },
      orderBy: { publishedAt: 'desc' },
      take: 20 // lazy loading/paginação futura
    }),
    prisma.marketplaceCategory.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
          Conecta SM <span style={{ color: '#3b82f6' }}>Marketplace</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1.125rem' }}>
          Soluções, serviços e benefícios exclusivos do nosso ecossistema para você.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <form style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              name="q"
              defaultValue={query}
              placeholder="Buscar por produto, serviço ou parceiro..."
              style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <select 
            name="categoria"
            defaultValue={categoryId}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
          >
            <option value="">Todas as Categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button type="submit" style={{ background: '#0f172a', color: '#fff', padding: '0 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Filtrar
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {ofertas.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '8px' }}>Nenhuma oferta encontrada</h3>
            <p style={{ color: '#64748b' }}>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          ofertas.map(oferta => (
            <Link key={oferta.id} href={`/marketplace/oferta/${oferta.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', 
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' 
              }}>
                <div style={{ height: '160px', background: '#e2e8f0', position: 'relative' }}>
                  {oferta.imageUrl && (
                    <Image src={oferta.imageUrl} alt={oferta.title} fill style={{ objectFit: 'cover' }} />
                  )}
                  {oferta.category && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {oferta.category.name}
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                    {oferta.title}
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem', marginBottom: '16px' }}>
                    <Store size={14} /> {oferta.partner.name}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {oferta.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>
                        <MapPin size={14} /> {oferta.location}
                      </div>
                    )}
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>
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
  );
}
