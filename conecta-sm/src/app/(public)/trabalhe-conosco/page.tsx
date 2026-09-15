import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { TrabalheConoscoForm } from './components/TrabalheConoscoForm';

export default async function TrabalheConoscoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;

  if (user) {
    const profile = await prisma.profile.findFirst({
      where: { auth_user_id: user.id }
    });

    userProfile = {
      nome: profile?.nome || '',
      email: profile?.email || user.email || '',
      telefone: profile?.telefone || ''
    };
  }

  return <TrabalheConoscoForm userProfile={userProfile} />;
}
