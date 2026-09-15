'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tipagem simplificada do Evento que a UI espera
export type AgendaEventData = {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category?: string;
};

export async function getCandidateEvents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const profile = await prisma.profile.findFirst({
    where: { auth_user_id: user.id }
  });

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const events = await prisma.calendarEvent.findMany({
    where: {
      ownerId: profile.id,
      cancelledAt: null,
    },
    orderBy: { startAt: 'asc' }
  });

  // Mapear para o formato que a UI do EventManager espera
  return events.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || undefined,
    startTime: e.startAt,
    endTime: e.endAt,
    color: 'blue', // Default ou deduzido
    category: e.eventType,
  }));
}

export async function createCandidateEvent(data: AgendaEventData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findFirst({
    where: { auth_user_id: user.id }
  });

  if (!profile) throw new Error('Perfil não encontrado');

  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description || '',
      eventType: data.category || 'EVENT',
      startAt: data.startTime,
      endAt: data.endTime,
      ownerId: profile.id,
      createdById: profile.id,
      modality: 'ONLINE',
      status: 'SCHEDULED'
    }
  });

  revalidatePath('/candidato/agenda');
  return event.id;
}

export async function updateCandidateEvent(id: string, data: Partial<AgendaEventData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findFirst({
    where: { auth_user_id: user.id }
  });
  if (!profile) throw new Error('Perfil não encontrado');

  // Verify ownership
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== profile.id) {
    throw new Error('Evento não encontrado ou não autorizado');
  }

  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startTime) updateData.startAt = data.startTime;
  if (data.endTime) updateData.endAt = data.endTime;
  if (data.category) updateData.eventType = data.category;

  await prisma.calendarEvent.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/candidato/agenda');
  return true;
}

export async function deleteCandidateEvent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findFirst({
    where: { auth_user_id: user.id }
  });
  if (!profile) throw new Error('Perfil não encontrado');

  // Verify ownership
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== profile.id) {
    throw new Error('Evento não encontrado ou não autorizado');
  }

  await prisma.calendarEvent.delete({
    where: { id }
  });

  revalidatePath('/candidato/agenda');
  return true;
}
