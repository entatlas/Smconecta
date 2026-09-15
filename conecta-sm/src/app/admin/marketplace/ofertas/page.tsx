import React from 'react';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Check, X, AlertCircle } from 'lucide-react';
import { moderateOffer } from '../actions';

export default async function AdminOfertas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') redirect('/acesso-negado');

  const ofertas = [];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a' }}>Moderação de Ofertas</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Aprove, rejeite ou suspenda ofertas criadas por parceiros.
        </p>
      </header>

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Oferta</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Parceiro</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Nenhuma oferta cadastrada.
                </td>
              </tr>
            ) : (
              ofertas.map(oferta => (
                <tr key={oferta.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontWeight: 600, color: '#0f172a' }}>{oferta.title}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{oferta.category?.name || 'Sem categoria'}</p>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>
                    {oferta.partner.name}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      background: oferta.status === 'PUBLISHED' ? '#dcfce7' : 
                                  oferta.status === 'PENDING' ? '#fef3c7' : 
                                  oferta.status === 'REJECTED' || oferta.status === 'SUSPENDED' ? '#fee2e2' : '#e2e8f0',
                      color: oferta.status === 'PUBLISHED' ? '#15803d' : 
                             oferta.status === 'PENDING' ? '#d97706' : 
                             oferta.status === 'REJECTED' || oferta.status === 'SUSPENDED' ? '#b91c1c' : '#475569'
                    }}>
                      {oferta.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {oferta.status === 'PENDING' && (
                      <>
                        <form action={() => {}}>
                          <button type="submit" title="Aprovar" style={{ padding: '6px', color: '#10b981', background: '#ecfdf5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <Check size={18} />
                          </button>
                        </form>
                        <form action={() => {}}>
                          <button type="submit" title="Rejeitar" style={{ padding: '6px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <X size={18} />
                          </button>
                        </form>
                      </>
                    )}
                    {oferta.status === 'PUBLISHED' && (
                      <form action={() => {}}>
                        <button type="submit" title="Suspender" style={{ padding: '6px', color: '#f59e0b', background: '#fffbeb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          <AlertCircle size={18} />
                        </button>
                      </form>
                    )}
                    {oferta.status === 'SUSPENDED' && (
                      <form action={() => {}}>
                        <button type="submit" title="Reativar" style={{ padding: '6px', color: '#10b981', background: '#ecfdf5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          <Check size={18} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
