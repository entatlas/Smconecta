'use client';

import React from 'react';
import { EventManager, Event as UiEvent } from '@/components/ui/event-manager';
import { createCandidateEvent, updateCandidateEvent, deleteCandidateEvent } from './actions';

interface AgendaClientProps {
  initialEvents: UiEvent[];
}

export function AgendaClient({ initialEvents }: AgendaClientProps) {
  
  const handleEventCreate = async (event: Omit<UiEvent, "id">) => {
    try {
      await createCandidateEvent({
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        category: event.category
      });
      // A página será revalidada (revalidatePath) pela server action, atualizando a UI
    } catch (err) {
      console.error('Erro ao criar evento', err);
      alert('Erro ao criar evento na agenda.');
    }
  };

  const handleEventUpdate = async (id: string, event: Partial<UiEvent>) => {
    try {
      await updateCandidateEvent(id, {
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        category: event.category
      });
    } catch (err) {
      console.error('Erro ao atualizar evento', err);
      alert('Erro ao atualizar evento.');
    }
  };

  const handleEventDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteCandidateEvent(id);
    } catch (err) {
      console.error('Erro ao deletar evento', err);
      alert('Erro ao deletar evento.');
    }
  };

  return (
    <EventManager 
      events={initialEvents}
      onEventCreate={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      className="bg-background text-foreground p-6 rounded-xl border border-border shadow-md" 
    />
  );
}
