'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createProfileFromOAuth(tipo: 'CANDIDATE' | 'COMPANY', birthDate?: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Usuário não autenticado');
  }

  // Verificar se já existe
  const existingProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  if (existingProfile) {
    // Se já existe, apenas redirecionar
    return { success: true };
  }

  const nome = user.user_metadata?.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';

  // Criar o Profile
  await prisma.profile.create({
    data: {
      auth_user_id: user.id,
      email: user.email!,
      nome: nome,
      tipo: tipo,
      // Cria a sub-tabela baseada no tipo
      ...(tipo === 'CANDIDATE' && {
        candidateProfile: { 
          create: {
            birthDate: birthDate ? new Date(birthDate) : undefined
          } 
        }
      }),
      ...(tipo === 'COMPANY' && {
        companyProfile: { 
          create: {
            cnpj: '00000000000000', // Placeholder as required by schema
            tradeName: nome,
            companyName: nome
          } 
        }
      }),
    }
  });

  return { success: true };
}
