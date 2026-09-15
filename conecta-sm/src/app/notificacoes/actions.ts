'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

// Helper de autenticação usando Supabase
async function getUserProfileId() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await prisma.profile.findUnique({
      where: { auth_user_id: user.id }
    });

    return profile?.id || null;
  } catch (error) {
    return null;
  }
}

export async function getMyNotifications() {
  const profileId = await getUserProfileId();
  if (!profileId) throw new Error('Não autenticado');

  return prisma.notification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

export async function markAsRead(id: string) {
  const profileId = await getUserProfileId();
  if (!profileId) throw new Error('Não autenticado');

  await prisma.notification.update({
    where: { id, profileId }, // Security: garante que pertence ao user
    data: { read: true, readAt: new Date() }
  });

  revalidatePath('/notificacoes');
}

export async function markAllAsRead() {
  const profileId = await getUserProfileId();
  if (!profileId) throw new Error('Não autenticado');

  await prisma.notification.updateMany({
    where: { profileId, read: false },
    data: { read: true, readAt: new Date() }
  });

  revalidatePath('/notificacoes');
}

export async function createTestNotification() {
  const profileId = await getUserProfileId();
  if (!profileId) throw new Error('Não autenticado');

  await prisma.notification.create({
    data: {
      profileId,
      title: 'Bem-vindo(a) ao sistema!',
      message: 'Esta é uma notificação de teste gerada agora mesmo.',
      type: 'INFO',
      read: false
    }
  });

  revalidatePath('/notificacoes');
}
