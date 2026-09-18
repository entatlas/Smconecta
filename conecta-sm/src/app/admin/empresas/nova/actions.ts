'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function createCompanyAdmin(data: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // 1. Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: 'Mudar123!',
      options: {
        data: {
          nome: data.companyName,
          telefone: data.telefone,
          tipo: 'COMPANY',
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Falha ao criar o usuário de autenticação.' };
    }

    // 2. Aguarda um momento para garantir que a trigger do Supabase termine de rodar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Atualiza os dados complexos usando Prisma
    const profile = await prisma.profile.findFirst({
      where: { auth_user_id: authData.user.id },
      include: { companyProfile: true }
    });

    if (!profile || !profile.companyProfile) {
      return { success: false, error: 'Erro ao encontrar o perfil criado pela trigger.' };
    }

    // 4. Update Profile & CompanyProfile
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          telefone: data.telefone,
          avatar_url: data.avatarUrl || null,
        }
      }),
      prisma.company.update({
        where: { id: profile.companyProfile.id },
        data: {
          companyName: data.companyName,
          tradeName: data.tradeName,
          cnpj: data.cnpj,
          website: data.website,
          industry: data.industry,
          companySize: data.companySize,
          about: data.about,
          address_city: data.city,
          address_state: data.state,
        }
      })
    ]);

    return { success: true };
  } catch (err: any) {
    console.error('Error in createCompanyAdmin:', err);
    return { success: false, error: err.message || 'Erro interno do servidor.' };
  }
}
