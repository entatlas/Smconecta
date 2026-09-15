import React from 'react';
import { EventoForm } from '../components/EventoForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoEventoPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/eventos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Voltar para Eventos
        </Link>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Novo Evento</h1>
        <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Cadastre os detalhes do evento. Você pode publicar depois.</p>
      </div>

      <EventoForm />
    </div>
  );
}
