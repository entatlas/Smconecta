import React from 'react';
import { EventoForm } from '../components/EventoForm';
import { getEventoById } from '../actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEventoById(id);

  if (!evento) {
    notFound();
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/eventos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Voltar para Eventos
        </Link>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Editar Evento</h1>
        <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Atualize as informações do seu evento.</p>
      </div>

      <EventoForm initialData={evento} />
    </div>
  );
}
