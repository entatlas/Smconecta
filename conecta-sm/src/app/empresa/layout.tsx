import { prisma } from '@/lib/prisma';
import React from 'react';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { CompanySidebar } from '@/components/layout/Sidebar/CompanySidebar';


export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  // Acesso exclusivo para EMPRESA ou ADMIN(para suporte/visualização)
  if (!profile || (profile.tipo !== 'COMPANY' && profile.tipo !== 'ADMIN')) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <CompanySidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full max-h-screen relative lg:pl-[260px]">
        {children}
      </main>
    </div>
  );
}
