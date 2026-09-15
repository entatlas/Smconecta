'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdmins() {
  const admins = await prisma.profile.findMany({
    where: { tipo: 'ADMIN' },
    select: {
      id: true,
      nome: true,
      email: true,
      status: true,
      created_at: true
    },
    orderBy: { created_at: 'desc' }
  });
  
  return admins;
}

export async function revokeAdmin(profileId: string) {
  await prisma.profile.update({
    where: { id: profileId },
    data: { status: 'INACTIVE' } // Ou talvez rebaixar para outro tipo
  });

  revalidatePath('/admin/configuracoes/administradores');
  return { success: true };
}
