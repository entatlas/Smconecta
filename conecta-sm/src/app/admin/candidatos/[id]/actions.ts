'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCandidateHistoryEvent(candidateId: string, eventType: string, title: string, description: string, profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  if (!profile) throw new Error('Profile not found');

  // Determinar relatedCompanyId se quem estiver postando for uma EMPRESA.
  // Se for ADMIN, fica null.
  const relatedCompanyId = profile.tipo === 'COMPANY' ? profile.id : null;

  await prisma.professionalHistory.create({
    data: {
      candidateId,
      eventType,
      title,
      description,
      createdById: profile.id,
      relatedCompanyId, // opcional
    }
  });

  revalidatePath(`/admin/candidatos/${profileId}`);
  // Se houver painel da empresa, revalida também
  revalidatePath(`/empresa/candidatos/${profileId}`);
}

export async function toggleSmStudentStatus(candidateId: string, isStudent: boolean, profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  if (!profile || profile.tipo !== 'ADMIN') {
    throw new Error('Only admins can perform this action');
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { isSmStudent: isStudent }
  });

  revalidatePath(`/admin/candidatos/${profileId}`);
}

export async function toggleUserStatus(profileId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  if (!profile || profile.tipo !== 'ADMIN') {
    throw new Error('Only admins can perform this action');
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { status }
  });

  revalidatePath(`/admin/candidatos/${profileId}`);
}
