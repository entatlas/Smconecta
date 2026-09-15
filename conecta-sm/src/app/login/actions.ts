'use server';

import { prisma } from '@/lib/prisma';

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const user = await prisma.profile.findFirst({
      where: { email },
      select: { id: true },
    });
    return !!user;
  } catch (error) {
    console.error('Error checking email:', error);
    // Em caso de erro do BD, deixamos o fluxo prosseguir para o Supabase resolver
    return true; 
  }
}
