'use server';

import { revalidatePath } from 'next/cache';

export async function getNotificationSettings() {
  return {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true
  };
}

export async function saveNotificationSettings(data: any) {
  console.log('Mock save notifications:', data);
  revalidatePath('/admin/configuracoes/notificacoes');
  return { success: true };
}
