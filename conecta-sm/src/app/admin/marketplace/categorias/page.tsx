import React from 'react';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { saveCategory } from '../actions';

export default async function AdminCategorias() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') redirect('/acesso-negado');

  const categorias = [];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a' }}>Gestão de Categorias</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Gerencie as categorias de ofertas do Marketplace.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        
        {/* Lista */}
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>Nome da Categoria</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Ofertas</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categorias.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</p>
                      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{cat.description || '-'}</p>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>
                      {cat._count.offers}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        background: cat.active ? '#dcfce7' : '#fee2e2',
                        color: cat.active ? '#15803d' : '#b91c1c'
                      }}>
                        {cat.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>Nova Categoria</h3>
          <form action={saveCategory.bind(null, null)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: '#334155' }}>Nome</label>
              <input name="name" required style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: '#334155' }}>Descrição (opcional)</label>
              <textarea name="description" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" name="active" value="true" defaultChecked style={{ width: '16px', height: '16px' }} />
                Ativa no sistema
              </label>
            </div>
            <button type="submit" style={{ marginTop: '8px', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Plus size={18} /> Cadastrar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
