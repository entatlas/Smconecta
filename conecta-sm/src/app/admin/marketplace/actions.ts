'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') throw new Error('Acesso negado');

  return profile;
}

export async function moderateOffer(offerId: string, status: string, reason?: string) {
  try {
    await checkAdmin();
    // mock
    revalidatePath('/admin/marketplace/ofertas');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function moderatePartner(partnerId: string, status: string, reason?: string) {
  try {
    await checkAdmin();
    // mock
    revalidatePath('/admin/marketplace/parceiros');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function saveCategory(id: string | null, formData: FormData) {
  try {
    await checkAdmin();
    // mock
    revalidatePath('/admin/marketplace/categorias');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
