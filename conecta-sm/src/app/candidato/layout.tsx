import React from 'react';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { CandidateSidebar } from '@/components/layout/Sidebar/CandidateSidebar';

import { prisma } from '@/lib/prisma';
import { PaywallWrapper } from '@/components/layout/PaywallWrapper/PaywallWrapper';

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Busca o status de assinatura do candidato logado
  const candidate = await prisma.candidate.findFirst({
    where: { profile: { auth_user_id: user.id } },
    select: { subscriptionStatus: true }
  });

  const status = candidate?.subscriptionStatus || 'TRIAL';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020B18' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .candidato-main { flex: 1; overflow-y: auto; margin-left: 260px; }
        @media (max-width: 1024px) { 
          .candidato-main { margin-left: 0; padding-top: 4rem; } 
        }
      `}} />
      <CandidateSidebar />
      <main className="candidato-main">
        <PaywallWrapper status={status}>
          {children}
        </PaywallWrapper>
      </main>
    </div>
  );
}
