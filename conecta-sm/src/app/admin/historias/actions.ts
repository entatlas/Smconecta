'use server';

import { prisma } from '@/lib/prisma';
import { sendEmailForEvent } from '@/lib/events/EmailService';

export async function getPendingStories() {
  return prisma.inspiringStory.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getStories(status?: 'PUBLISHED' | 'ARCHIVED') {
  return prisma.inspiringStory.findMany({
    where: status ? { status } : { status: { in: ['PUBLISHED', 'ARCHIVED'] } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function approveStory(id: string) {
  try {
    const story = await prisma.inspiringStory.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { author: true }
    });

    if (story.author && story.author.email) {
      await sendEmailForEvent('STORY_APPROVED', {
        to: story.author.email,
        nome: story.name,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao aprovar historia:", error);
    return { success: false, error: 'Erro ao aprovar história.' };
  }
}

export async function publishStory(id: string) {
  try {
    const story = await prisma.inspiringStory.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: { author: true }
    });

    if (story.author && story.author.email) {
      await sendEmailForEvent('STORY_PUBLISHED', {
        to: story.author.email,
        nome: story.name,
        link: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/historias/${story.id}`
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao publicar historia:", error);
    return { success: false, error: 'Erro ao publicar história.' };
  }
}

export async function rejectStory(id: string) {
  try {
    await prisma.inspiringStory.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao reprovar história.' };
  }
}

export async function toggleHighlight(id: string, isFeatured: boolean) {
  try {
    await prisma.inspiringStory.update({
      where: { id },
      data: { isFeatured }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao favoritar história.' };
  }
}

export async function deleteStory(id: string) {
  try {
    await prisma.inspiringStory.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao excluir história.' };
  }
}

export async function getStoryById(id: string) {
  return prisma.inspiringStory.findUnique({
    where: { id }
  });
}

export async function updateStory(id: string, data: any) {
  try {
    await prisma.inspiringStory.update({
      where: { id },
      data: {
        name: data.name,
        profession: data.profession,
        company: data.company,
        city: data.city,
        courseName: data.courseName,
        content: data.content,
        caseBefore: data.caseBefore,
        caseTraining: data.caseTraining,
        caseExperience: data.caseExperience,
        caseResult: data.caseResult,
        caseCurrent: data.caseCurrent
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar história.' };
  }
}
