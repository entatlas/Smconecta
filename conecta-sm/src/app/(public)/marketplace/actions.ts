'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestOfferInterest(offerId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Você precisa estar logado para solicitar interesse.');
    }

    const profile = await prisma.profile.findUnique({
      where: { auth_user_id: user.id }
    });

    if (!profile) {
      throw new Error('Perfil não encontrado.');
    }

    // Verifica se já não solicitou antes
    const existingRequest = await prisma.marketplaceRequest.findFirst({
      where: {
        offerId,
        requesterId: profile.id
      }
    });

    if (existingRequest) {
      throw new Error('Você já demonstrou interesse nesta oferta.');
    }

    await prisma.marketplaceRequest.create({
      data: {
        offerId,
        requesterId: profile.id,
        status: 'NEW'
      }
    });

    revalidatePath(`/marketplace/oferta/${offerId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
