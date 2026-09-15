'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getVisibility() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { candidateProfile: true }
  });

  if (!profile?.candidateProfile) throw new Error('Candidato não encontrado');

  return profile.candidateProfile.visibility; // "PUBLIC", "UPON_APPLICATION", "PRIVATE"
}

export async function updateVisibility(visibility: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { candidateProfile: true }
  });

  if (!profile?.candidateProfile) throw new Error('Candidato não encontrado');

  await prisma.candidate.update({
    where: { id: profile.candidateProfile.id },
    data: { visibility }
  });

  revalidatePath('/candidato/perfil');
  return true;
}
