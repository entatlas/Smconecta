'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { StoryType, StoryStatus } from '@prisma/client';

export async function submitInspiringStory(data: any) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    let authorId = null;
    
    // Se o usuário estiver logado, buscar o Profile correspondente
    if (session?.user?.id) {
      const profile = await prisma.profile.findUnique({
        where: { auth_user_id: session.user.id }
      });
      if (profile) {
        authorId = profile.id;
      }
    }
    
    // Criar o registro no banco de dados como PENDENTE
    const newStory = await prisma.inspiringStory.create({
      data: {
        authorId: authorId,
        courseId: data.courseId || null,
        name: data.name,
        whatsapp: data.whatsapp || null,
        courseName: data.courseName || null,
        profession: data.profession || null,
        company: data.company || null,
        city: data.city || null,
        type: data.type as StoryType,
        status: 'PENDING' as StoryStatus,
        coverUrl: data.coverUrl || null,
        mediaUrl: data.mediaUrl || null,
        content: data.content || null,
        caseBefore: data.caseBefore || null,
        caseTraining: data.caseTraining || null,
        caseExperience: data.caseExperience || null,
        caseResult: data.caseResult || null,
        caseCurrent: data.caseCurrent || null,
      }
    });

    return { success: true, story: newStory };
    
  } catch (error) {
    console.error("Erro ao enviar história:", error);
    return { success: false, error: 'Ocorreu um erro ao enviar sua história. Tente novamente mais tarde.' };
  }
}
