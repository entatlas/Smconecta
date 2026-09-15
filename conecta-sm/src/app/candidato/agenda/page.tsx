import React from 'react'
import { Calendar } from 'lucide-react'
import { getCandidateEvents } from './actions'
import { AgendaClient } from './AgendaClient'

export default async function AgendaPage() {
  const events = await getCandidateEvents();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#EAF2FF' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Calendar size={24} color="#00D9FF" /> Minha Agenda
      </h1>
      <p style={{ color: '#9BAFC8', marginBottom: '2rem' }}>Entrevistas e compromissos relacionados às suas candidaturas.</p>

      <AgendaClient initialEvents={events as any} />
    </div>
  )
}
