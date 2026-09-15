'use client';

import React, { useEffect, useState } from 'react';
import { EventManager, Event as UiEvent } from '@/components/ui/event-manager';
import { getAllInterviews, updateInterviewStatus, updateInterviewDate, getAdminCalendarEvents, createAdminCalendarEvent, updateAdminCalendarEvent, deleteAdminCalendarEvent } from './actions';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AdminAgendaPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'MEETING',
    location: '',
    description: ''
  });

  const loadData = async () => {
    try {
      const [interviewsRes, calendarEventsRes] = await Promise.all([
        getAllInterviews(),
        getAdminCalendarEvents()
      ]);
      
      const uiEvents = interviewsRes.map((inv: any) => {
        const dateObj = new Date(inv.date);
        const [hours, minutes] = inv.time.split(':');
        const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), parseInt(hours), parseInt(minutes));
        const end = new Date(start.getTime() + (inv.duration * 60000));
        
        let color = 'blue';
        if (inv.status === 'COMPLETED') color = 'green';
        if (inv.status === 'CANCELLED') color = 'red';
        if (inv.status === 'NO_SHOW') color = 'orange';

        let typeStr = inv.type === 'ONLINE' ? '🎥 Online' : inv.type === 'PHONE' ? '📞 Telefone' : '📍 Presencial';

        return {
          id: inv.id,
          title: `${inv.job?.title || 'Vaga'} - ${inv.candidate?.profile?.nome || 'Candidato'} (${inv.company?.companyName || 'Empresa'})`,
          description: `Empresa: ${inv.company?.companyName || 'N/A'}\nStatus: ${inv.status}\nTipo: ${typeStr}\nLocal/Link: ${inv.locationOrLink}\n\nObservações: ${inv.notes || ''}`,
          startTime: start,
          endTime: end,
          color: color,
          category: 'Entrevista'
        };
      });
      
      const adminEvents = calendarEventsRes.map((evt: any) => {
        let color = 'purple';
        if (evt.eventType === 'MEETING') color = 'blue';
        if (evt.eventType === 'CLASS') color = 'orange';

        return {
          id: evt.id,
          title: evt.title,
          description: `Tipo: ${evt.eventType}\nLocal: ${evt.location || 'N/A'}\n\nObservações: ${evt.description || ''}`,
          startTime: new Date(evt.startAt),
          endTime: new Date(evt.endAt),
          color: color,
          category: evt.eventType,
          isGenericEvent: true // Custom flag to distinguish
        };
      });
      
      setEvents([...uiEvents, ...adminEvents]);
    } catch (err) {
      toast.error('Erro ao carregar dados da agenda geral');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEventUpdate = async (id: string, updatedEvent: Partial<UiEvent>) => {
     try {
       const existingEvent = events.find(e => e.id === id);
       if (!existingEvent) return;

       if (updatedEvent.startTime) {
         const date = new Date(updatedEvent.startTime);
         if ((existingEvent as any).isGenericEvent) {
            // Update Generic Event
            const end = updatedEvent.endTime ? new Date(updatedEvent.endTime) : new Date(date.getTime() + 60 * 60000);
            await updateAdminCalendarEvent(id, { startAt: date, endAt: end });
            toast.success('Evento reagendado!');
         } else {
            // Update Interview
            const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            await updateInterviewDate(id, date, time);
            toast.success('Entrevista reagendada com sucesso!');
         }
       }
     } catch(err) {
       toast.error('Erro ao reagendar evento');
     }
     loadData();
  };

  const handleEventDelete = async (id: string) => {
     if (!confirm('Deseja excluir este evento da agenda?')) return;
     try {
       const existingEvent = events.find(e => e.id === id);
       if ((existingEvent as any)?.isGenericEvent) {
         await deleteAdminCalendarEvent(id);
         toast.success('Evento excluído!');
       } else {
         await updateInterviewStatus(id, 'CANCELLED');
         toast.success('Entrevista cancelada!');
       }
       loadData();
     } catch (err) {
       toast.error('Erro ao excluir evento');
     }
  };

  const handleDayClick = (date: Date) => {
    setNewEvent(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const handleNewEventClick = () => {
    setNewEvent(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      toast.error('Preencha os campos obrigatórios (Título, Data e Horários)');
      return;
    }
    
    setIsSaving(true);
    try {
      const startAt = new Date(`${newEvent.date}T${newEvent.startTime}:00Z`);
      const endAt = new Date(`${newEvent.date}T${newEvent.endTime}:00Z`);
      
      // Ajuste de timezone basico (considerando que o input HTML gera local time, T...Z pode dar offset errado)
      // Melhor usar new Date() local:
      const [startH, startM] = newEvent.startTime.split(':');
      const [endH, endM] = newEvent.endTime.split(':');
      const [y, m, d] = newEvent.date.split('-');
      
      const startObj = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(startH), parseInt(startM));
      const endObj = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(endH), parseInt(endM));

      await createAdminCalendarEvent({
        title: newEvent.title,
        eventType: newEvent.eventType,
        startAt: startObj,
        endAt: endObj,
        location: newEvent.location,
        description: newEvent.description
      });

      toast.success('Evento criado com sucesso!');
      setIsDialogOpen(false);
      
      setNewEvent({
        title: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        eventType: 'MEETING',
        location: '',
        description: ''
      });
      
      loadData();
    } catch (err) {
      toast.error('Erro ao criar evento');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-slate-400">Carregando Agenda Geral...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Agenda Geral</h1>
        <p className="text-muted-foreground">Visão de todas as entrevistas marcadas na plataforma.</p>
      </div>

      <EventManager 
        events={events}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        categories={['Entrevista', 'MEETING', 'CLASS', 'EVENT', 'OTHER']}
        onDayClick={handleDayClick}
        onNewEventClick={handleNewEventClick}
        onEventCreate={() => {}} 
        className="bg-background text-foreground p-4 md:p-6 rounded-xl border border-border shadow-md"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título do Evento</Label>
              <Input 
                value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Reunião Comercial - Tech Corp"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select 
                value={newEvent.eventType}
                onValueChange={v => setNewEvent(p => ({ ...p, eventType: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEETING">Reunião</SelectItem>
                  <SelectItem value="CLASS">Aula / Treinamento</SelectItem>
                  <SelectItem value="EVENT">Evento</SelectItem>
                  <SelectItem value="COMMITMENT">Compromisso Pessoal</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date" 
                value={newEvent.date}
                onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de Início</Label>
                <Input 
                  type="time" 
                  value={newEvent.startTime}
                  onChange={e => setNewEvent(p => ({ ...p, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Término</Label>
                <Input 
                  type="time" 
                  value={newEvent.endTime}
                  onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Local ou Link</Label>
              <Input 
                value={newEvent.location}
                onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
                placeholder="Ex: Sala 02 ou https://meet.google..."
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea 
                value={newEvent.description}
                onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                placeholder="Detalhes adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEvent} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
