'use server';
import { prisma } from '@/lib/prisma';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';


export async function getProfessionalAreas() {
  return await prisma.professionalArea.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });
}

export async function getCandidateInterests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: {
      candidateProfile: {
        include: {
          professionalInterests: {
            include: { professionalArea: true }
          }
        }
      }
    }
  });

  if (!profile?.candidateProfile) throw new Error('Candidate profile not found');

  return profile.candidateProfile.professionalInterests.map(i => i.professionalArea);
}

export async function updateCandidateInterests(areaIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { candidateProfile: true }
  });

  const candidateId = profile?.candidateProfile?.id;
  if (!candidateId) throw new Error('Candidate profile not found');

  // Transaction to update
  await prisma.$transaction(async (tx) => {
    // Excluir antigas
    await tx.candidateProfessionalInterest.deleteMany({
      where: { candidateId }
    });

    // Inserir novas
    if (areaIds.length > 0) {
      await tx.candidateProfessionalInterest.createMany({
        data: areaIds.map(id => ({
          candidateId,
          professionalAreaId: id
        }))
      });
    }
  });

  revalidatePath('/candidato/perfil');
  return true;
}
