import React from 'react';
import { ReportTable } from '@/components/relatorios/ReportTable';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminRelatorios() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') redirect('/acesso-negado');

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF' }}>Relatórios Gerais</h1>
        <p style={{ color: '#8B9BB4', marginTop: '8px', fontSize: '1.125rem' }}>
          Geração e exportação de relatórios da plataforma. Todas as exportações são auditadas.
        </p>
      </header>

      <ReportTable />
    </div>
  );
}
