import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Users, Clock, BookOpen, Star, MoreVertical, Share2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { getEventos, getInstagramStatus, disconnectInstagram } from './actions';
import { EventoActionButtons } from './components/EventoActionButtons';
import Link from 'next/link';

export default async function EventosPage() {
  const eventos = await getEventos();
  const igStatus: any = await getInstagramStatus();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      
      {/* Banner Instagram */}
      <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: igStatus.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)', border: `1px solid ${igStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: igStatus.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)', padding: '10px', borderRadius: '50%' }}>
            <Share2 size={24} color={igStatus.connected ? '#10b981' : '#eab308'} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: igStatus.connected ? '#10b981' : '#eab308' }}>
              {igStatus.connected ? 'Instagram Conectado' : 'Instagram não conectado'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4', marginTop: '2px' }}>
              {igStatus.connected ? `Postagens automáticas ativadas para @${igStatus.username || 'sua conta'}` : 'Conecte seu Instagram para publicar eventos diretamente no feed.'}
            </p>
          </div>
        </div>
        {igStatus.connected ? (
          <form action={async () => { "use server"; await disconnectInstagram(); }}>
            <Button type="submit" variant="outline" style={{ border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', background: 'transparent' }}>
              Desconectar
            </Button>
          </form>
        ) : (
          <a href="/api/instagram/auth">
            <Button variant="default" style={{ background: 'linear-gradient(to right, #ec4899, #9333ea)', border: 'none', color: '#fff', fontWeight: 'bold' }}>
              Conectar Agora
            </Button>
          </a>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EAF2FF', margin: '0 0 0.5rem 0' }}>Mural de Eventos</h1>
          <p style={{ margin: 0, color: '#8B9BB4', fontSize: '1.125rem' }}>Gerencie todos os eventos e treinamentos publicados na plataforma.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/eventos/novo">
            <Button variant="default" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Plus size={16} /> Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {eventos.length === 0 ? (
        <EmptyState 
          icon={<Calendar size={64} style={{ opacity: 0.2 }} color="var(--color-primary)" />}
          title="Nenhum evento publicado"
          description="Ainda não existem eventos cadastrados no sistema."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {eventos.map(evento => (
            <div key={evento.id} style={{ 
              background: '#031225', 
              border: '1px solid #11284A', 
              borderRadius: '12px', 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Flyer Cover */}
              <div style={{
                height: '140px',
                background: evento.coverUrl ? `url(${evento.coverUrl}) center/cover no-repeat` : '#061A32',
                borderBottom: '1px solid #11284A',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px'
              }}>
                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {evento.type}
                  </span>
                  {evento.isHighlighted && (
                    <span style={{ background: 'rgba(234, 179, 8, 0.9)', color: '#000', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} /> Destaque
                    </span>
                  )}
                </div>
                {/* Status Badge */}
                <span style={{ 
                  background: evento.status === 'PUBLISHED' ? '#10b981' : evento.status === 'DRAFT' ? '#64748b' : '#ef4444', 
                  color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 
                }}>
                  {evento.status === 'PUBLISHED' ? 'Publicado' : evento.status === 'DRAFT' ? 'Rascunho' : evento.status}
                </span>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: '#EAF2FF' }}>{evento.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {evento.description}
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #11284A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                    <Calendar size={16} />
                    <span>{(evento as any).eventDate ? new Date((evento as any).eventDate).toLocaleDateString('pt-BR') : evento.startDate ? new Date(evento.startDate).toLocaleDateString('pt-BR') : 'Data não definida'}</span>
                  </div>
                  {((evento as any).eventTimeStart || (evento as any).eventTimeEnd) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                      <Clock size={16} />
                      <span>{(evento as any).eventTimeStart || ''} {(evento as any).eventTimeEnd ? `até ${(evento as any).eventTimeEnd}` : ''}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B9BB4', fontSize: '0.875rem' }}>
                    <MapPin size={16} />
                    <span>{evento.modality === 'ONLINE' ? 'Online' : evento.city ? `${evento.city}, ${evento.state}` : evento.locationName || 'Local não definido'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <EventoActionButtons eventoId={evento.id} currentStatus={evento.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
