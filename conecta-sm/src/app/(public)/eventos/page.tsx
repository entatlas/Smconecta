import React from 'react';
import Link from 'next/link';
import { getPublicEventos } from './actions';
import { Calendar, MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Eventos | Conecta SM',
  description: 'Descubra os próximos eventos, palestras e workshops.',
};

export default async function PublicEventosPage() {
  const eventos = await getPublicEventos();

  return (
    <div style={{ backgroundColor: '#020b18', minHeight: '100vh', color: '#EAF2FF', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px 0', background: 'linear-gradient(to right, #00D9FF, #0055FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Eventos
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#8B9BB4', maxWidth: '600px', margin: '0 auto' }}>
            Participe dos melhores eventos e workshops para impulsionar a sua carreira e se conectar com grandes profissionais.
          </p>
        </div>

        {eventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#8B9BB4' }}>
            <Calendar size={64} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EAF2FF', margin: '0 0 8px 0' }}>Nenhum evento disponível no momento</h2>
            <p>Fique de olho, em breve teremos novidades.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {eventos.map(evento => (
              <div key={evento.id} style={{ 
                background: '#031225', 
                border: '1px solid #11284A', 
                borderRadius: '16px', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }} className="hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,85,255,0.15)]">
                
                {/* Imagem de Capa */}
                <div style={{
                  height: '200px',
                  background: evento.coverUrl ? `url(${evento.coverUrl}) center/cover no-repeat` : '#061A32',
                  borderBottom: '1px solid #11284A',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                      {evento.type}
                    </span>
                    {evento.isHighlighted && (
                      <span style={{ background: 'rgba(234, 179, 8, 0.9)', color: '#000', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '100px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} /> Destaque
                      </span>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 700, color: '#EAF2FF', lineHeight: 1.2 }}>
                    {evento.title}
                  </h3>
                  <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: '#8B9BB4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {evento.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.9rem' }}>
                      <Calendar size={18} className="text-blue-500" />
                      <span>{evento.eventDate ? new Date(evento.eventDate).toLocaleDateString('pt-BR') : evento.startDate ? new Date(evento.startDate).toLocaleDateString('pt-BR') : 'Data em breve'}</span>
                    </div>
                    {(evento.eventTimeStart || evento.eventTimeEnd) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.9rem' }}>
                        <Clock size={18} className="text-blue-500" />
                        <span>{evento.eventTimeStart || ''} {evento.eventTimeEnd ? `às ${evento.eventTimeEnd}` : ''}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.9rem' }}>
                      <MapPin size={18} className="text-blue-500" />
                      <span>{evento.modality === 'ONLINE' ? 'Online' : evento.city ? `${evento.city}, ${evento.state}` : evento.locationName || 'Local a definir'}</span>
                    </div>
                  </div>

                  <Link href={`/eventos/${evento.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <Button variant="primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}>
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
