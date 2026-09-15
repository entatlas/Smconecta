'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Video, MapPin, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CandidatoAgenda() {
  const eventos = [
    { id: 1, title: 'Entrevista: Desenvolvedor Front-end', type: 'Entrevista', time: 'Hoje, 10:00 - 11:00', modality: 'ONLINE', participants: 'Tech Corp, Maria Souza (SM)', status: 'PENDING', url: 'https://meet.google.com/abc-defg-hij' },
    { id: 2, title: 'Aula: React Avançado - Módulo 2', type: 'Aula', time: 'Amanhã, 19:00 - 21:00', modality: 'ONLINE', participants: 'Prof. Ana, Turma 4', status: 'CONFIRMED', url: 'https://zoom.us/j/12345' },
    { id: 3, title: 'Feira de Empregabilidade SM', type: 'Evento', time: '15/08/2026, 09:00 - 18:00', modality: 'PRESENCIAL', location: 'Centro de Convenções SM', participants: 'Público Geral', status: 'CONFIRMED' },
  ];

  return (
    <div style={{ padding: 'var(--spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Minha Agenda</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Acompanhe suas próximas entrevistas, aulas e eventos.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* SIDEBAR ESQUERDA - RESUMO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Próximo Compromisso</h3>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Entrevista: Desenvolvedor Front-end</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 500 }}><Clock size={16} /> Hoje, às 10:00</p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button style={{ backgroundColor: 'white', color: 'var(--color-primary)', flex: 1 }}>Confirmar Presença</Button>
            </div>
          </Card>

          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Resumo da Semana</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-secondary)' }}>Entrevistas:</span> <span style={{ fontWeight: 600 }}>1</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-secondary)' }}>Aulas (Cursos):</span> <span style={{ fontWeight: 600 }}>2</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-text-secondary)' }}>Eventos Extras:</span> <span style={{ fontWeight: 600 }}>1</span></div>
            </div>
          </Card>
        </div>

        {/* ÁREA PRINCIPAL - LISTA DE EVENTOS */}
        <Card style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Próximos 7 dias</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {eventos.map(evt => (
              <div key={evt.id} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: evt.type === 'Entrevista' ? 'var(--color-primary-light)' : evt.type === 'Aula' ? 'var(--color-warning-light)' : 'var(--color-success-light)', color: evt.type === 'Entrevista' ? 'var(--color-primary-dark)' : evt.type === 'Aula' ? 'var(--color-warning-dark)' : 'var(--color-success-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{evt.time.split(',')[0]}</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: evt.type === 'Entrevista' ? 'var(--color-primary)' : 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{evt.type}</span>
                      <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem' }}>{evt.title}</h4>
                    </div>
                    {evt.status === 'PENDING' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        AGUARDANDO SUA CONFIRMAÇÃO
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success-dark)' }}>
                        <CheckCircle size={12} /> PRESENÇA CONFIRMADA
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {evt.time.split(', ')[1]}</span>
                    {evt.modality === 'ONLINE' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Video size={14} /> Online</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {evt.location}</span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} /> Com: {evt.participants}</span>
                  </div>

                  {evt.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Button size="sm" style={{ backgroundColor: 'var(--color-success)' }}><CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> Confirmar</Button>
                      <Button size="sm" variant="outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}><XCircle size={16} style={{ marginRight: '0.5rem' }} /> Não poderei comparecer</Button>
                    </div>
                  ) : (
                    <div>
                      {evt.modality === 'ONLINE' && (
                        <Button size="sm" variant="outline">Acessar Link da Reunião <ArrowRight size={14} style={{ marginLeft: '0.5rem' }} /></Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </Card>
      </div>

    </div>
  );
}
