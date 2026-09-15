'use server';

import { prisma } from '@/lib/prisma';

export async function getSMCandidaturas() {
  try {
    const history = await prisma.professionalHistory.findMany({
      where: {
        eventType: 'JOB_APPLIED',
        title: 'Inscrição: Equipe Técnica Multidisciplinar SM'
      },
      include: {
        candidate: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        eventDate: 'desc'
      }
    });

    return {
      success: true,
      data: history.map(h => ({
        id: h.id,
        candidateId: h.candidateId,
        profileId: h.candidate.profile.id,
        nome: h.candidate.profile.nome,
        email: h.candidate.profile.email,
        telefone: h.candidate.profile.telefone || 'Não informado',
        data: h.eventDate,
        respostas: h.description || ''
      }))
    };
  } catch (err: any) {
    console.error('Error in getSMCandidaturas:', err);
    return { success: false, error: 'Erro ao buscar candidaturas SM.' };
  }
}
