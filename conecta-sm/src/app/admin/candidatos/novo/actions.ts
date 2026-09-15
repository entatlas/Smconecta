'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function createCandidateAdmin(data: any) {
  try {
    // Usamos um client puro (sem cookies) para não deslogar o Admin
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // 1. Criar o usuário no Supabase Auth
    // Usamos signUp que vai disparar o trigger e criar o Profile/Candidate
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: 'Mudar123!',
      options: {
        data: {
          nome: data.nome,
          telefone: data.telefone,
          tipo: 'CANDIDATE',
          birthDate: data.birthDate
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
      include: { candidateProfile: true }
    });

    if (!profile || !profile.candidateProfile) {
      return { success: false, error: 'Erro ao encontrar o perfil criado pela trigger.' };
    }

    // 4. Update Profile & Candidate
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          telefone: data.telefone,
          avatar_url: data.avatarUrl || null,
        }
      }),
      prisma.candidate.update({
        where: { id: profile.candidateProfile.id },
        data: {
          city: data.city,
          state: data.state,
          desiredRole: data.desiredRole,
          professionalArea: data.professionalArea,
          headline: data.headline,
          about: data.about,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          education: {
            create: data.education.map((e: any) => ({
              institution: e.institution,
              course: e.course,
              level: e.level,
              status: e.status,
              startDate: e.startDate ? new Date(e.startDate) : null,
              endDate: e.endDate ? new Date(e.endDate) : null,
            }))
          },
          experiences: {
            create: data.experiences.map((e: any) => ({
              company: e.company,
              role: e.role,
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : null,
              isCurrent: e.isCurrent,
              activities: e.activities,
            }))
          },
          skills: {
            create: data.skills?.map((s: any) => ({
              name: s.name,
              level: s.level,
            })) || []
          },
          languages: {
            create: data.languages?.map((l: any) => ({
              language: l.language,
              understanding: l.understanding,
              speaking: l.speaking,
              reading: l.reading,
              writing: l.writing,
            })) || []
          }
        }
      })
    ]);

    return { success: true };
  } catch (err: any) {
    console.error('Error in createCandidateAdmin:', err);
    return { success: false, error: err.message || 'Erro interno do servidor.' };
  }
}
