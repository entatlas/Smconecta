'use server';

import { revalidatePath } from 'next/cache';

export async function getAppearanceSettings() {
  return {
    primaryColor: '#00D9FF',
    colorMode: 'Escuro (Padrão)',
    logoUrl: ''
  };
}

export async function saveAppearanceSettings(data: any) {
  console.log('Mock save appearance:', data);
  revalidatePath('/admin/configuracoes/aparencia');
  return { success: true };
}
