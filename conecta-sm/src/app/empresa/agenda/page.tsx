'use client';

import React, { useEffect, useState } from 'react';
import { EventManager, Event as UiEvent } from '@/components/ui/event-manager';
import { getCompanyInterviews, updateInterviewStatus, updateInterviewDate, getCompanyApplicationsForAgenda, scheduleInterview } from './actions';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/contexts/I18nContext';

export default function EmpresaAgendaPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newInterview, setNewInterview] = useState({
    applicationId: '',
    date: '',
    time: '09:00',
    duration: 60,
    type: 'ONLINE',
    locationOrLink: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [interviewsRes, applicationsRes] = await Promise.all([
        getCompanyInterviews(),
        getCompanyApplicationsForAgenda()
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
          title: `${inv.job?.title || 'Vaga'} - ${inv.candidate?.profile?.nome || 'Candidato'}`,
          description: `Status: ${inv.status}\nTipo: ${typeStr}\nLocal/Link: ${inv.locationOrLink}\n\nObservações: ${inv.notes || ''}`,
          startTime: start,
          endTime: end,
          color: color,
          category: 'Entrevista'
        };
      });
      
      setEvents(uiEvents);
      setApplications(applicationsRes);
    } catch (err) {
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEventUpdate = async (id: string, updatedEvent: Partial<UiEvent>) => {
     try {
       if (updatedEvent.startTime) {
         const date = new Date(updatedEvent.startTime);
         const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
         await updateInterviewDate(id, date, time);
         toast.success('Entrevista reagendada com sucesso!');
       }
     } catch(err) {
       toast.error('Erro ao remarcar entrevista');
     }
     loadData();
  };

  const handleEventDelete = async (id: string) => {
     if (!confirm('Deseja cancelar esta entrevista?')) return;
     try {
       await updateInterviewStatus(id, 'CANCELLED');
       toast.success('Entrevista cancelada!');
       loadData();
     } catch (err) {
       toast.error('Erro ao cancelar entrevista');
     }
  };

  const handleDayClick = (date: Date) => {
    setNewInterview(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const handleNewEventClick = () => {
    setNewInterview(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const handleSaveInterview = async () => {
    if (!newInterview.applicationId || !newInterview.date || !newInterview.time) {
      toast.error('Preencha os campos obrigatórios (Candidato, Data e Hora)');
      return;
    }
    
    setIsSaving(true);
    try {
      const app = applications.find(a => a.applicationId === newInterview.applicationId);
      if (!app) throw new Error('Candidatura não encontrada');

      const dateObj = new Date(newInterview.date + 'T12:00:00Z');

      await scheduleInterview({
        applicationId: app.applicationId,
        candidateId: app.candidateId,
        jobId: app.jobId,
        date: dateObj,
        time: newInterview.time,
        duration: newInterview.duration,
        type: newInterview.type,
        locationOrLink: newInterview.locationOrLink,
        notes: newInterview.notes
      });

      toast.success('Entrevista agendada!');
      setIsDialogOpen(false);
      
      // Reseta form
      setNewInterview({
        applicationId: '',
        date: '',
        time: '09:00',
        duration: 60,
        type: 'ONLINE',
        locationOrLink: '',
        notes: ''
      });
      
      loadData();
    } catch (err) {
      toast.error('Erro ao agendar entrevista');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-slate-400">{t('agenda.loading')}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('agenda.title')}</h1>
        <p className="text-muted-foreground">{t('agenda.subtitle')}</p>
      </div>

      <EventManager 
        events={events}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        categories={['Entrevista']}
        onDayClick={handleDayClick}
        onNewEventClick={handleNewEventClick}
        onEventCreate={() => {}} 
        className="bg-background text-foreground p-4 md:p-6 rounded-xl border border-border shadow-md"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('agenda.newDialogTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('agenda.candidateLabel')}</Label>
              <Select 
                value={newInterview.applicationId} 
                onValueChange={v => setNewInterview(p => ({ ...p, applicationId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('agenda.candidatePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(app => (
                    <SelectItem key={app.applicationId} value={app.applicationId}>
                      {app.candidateName} ({app.jobTitle})
                    </SelectItem>
                  ))}
                  {applications.length === 0 && (
                    <SelectItem value="empty" disabled>Nenhum candidato disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('agenda.dateLabel')}</Label>
                <Input 
                  type="date" 
                  value={newInterview.date}
                  onChange={e => setNewInterview(p => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('agenda.timeLabel')}</Label>
                <Input 
                  type="time" 
                  value={newInterview.time}
                  onChange={e => setNewInterview(p => ({ ...p, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('agenda.durationLabel')}</Label>
                <Input 
                  type="number" 
                  value={newInterview.duration}
                  onChange={e => setNewInterview(p => ({ ...p, duration: parseInt(e.target.value) || 60 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('agenda.typeLabel')}</Label>
                <Select 
                  value={newInterview.type}
                  onValueChange={v => setNewInterview(p => ({ ...p, type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="IN_PERSON">Presencial</SelectItem>
                    <SelectItem value="PHONE">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('agenda.locationLabel')}</Label>
              <Input 
                value={newInterview.locationOrLink}
                onChange={e => setNewInterview(p => ({ ...p, locationOrLink: e.target.value }))}
                placeholder={t('agenda.locationPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('agenda.notesLabel')}</Label>
              <Textarea 
                value={newInterview.notes}
                onChange={e => setNewInterview(p => ({ ...p, notes: e.target.value }))}
                placeholder={t('agenda.notesPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('agenda.cancel')}</Button>
            <Button onClick={handleSaveInterview} disabled={isSaving}>
              {isSaving ? t('agenda.saving') : t('agenda.newDialogSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
