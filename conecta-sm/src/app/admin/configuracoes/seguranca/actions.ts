'use server';

import { revalidatePath } from 'next/cache';

export async function getSecuritySettings() {
  return {
    require2FA: false,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  };
}

export async function saveSecuritySettings(data: any) {
  // Prisma model SystemSetting nao existe ainda
  console.log('Mock save security:', data);
  revalidatePath('/admin/configuracoes/seguranca');
  return { success: true };
}
