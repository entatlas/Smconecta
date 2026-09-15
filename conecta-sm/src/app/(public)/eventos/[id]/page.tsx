import React from 'react';
import Link from 'next/link';
import { getPublicEventoById } from '../actions';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Clock, Info, CheckCircle, GraduationCap, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  const evento = await getPublicEventoById(id);
  
  if (!evento) return { title: 'Evento Não Encontrado' };
  
  return {
    title: `${evento.title} | Conecta SM`,
    description: evento.description,
  };
}

export default async function PublicEventoDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const evento = await getPublicEventoById(id);

  if (!evento) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: '#020b18', minHeight: '100vh', color: '#EAF2FF', paddingTop: '80px', paddingBottom: '80px' }}>
      
      {/* Hero Banner with Flyer */}
      {evento.coverUrl ? (
        <div style={{ width: '100%', height: '400px', position: 'relative', background: `linear-gradient(to bottom, rgba(2,11,24,0.1), #020b18), url(${evento.coverUrl}) center/cover no-repeat` }} />
      ) : (
        <div style={{ width: '100%', height: '200px', background: 'linear-gradient(to right, #001233, #002866)' }} />
      )}

      <div style={{ maxWidth: '1000px', margin: '-100px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        <Link href="/eventos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00D9FF', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '24px', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '100px', backdropFilter: 'blur(8px)' }}>
          <ArrowLeft size={16} /> Voltar para Eventos
        </Link>

        {/* Card Principal */}
        <div style={{ background: '#031225', border: '1px solid #11284A', borderRadius: '24px', padding: '48px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(0, 85, 255, 0.2)', color: '#00D9FF', fontSize: '0.875rem', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, border: '1px solid rgba(0,85,255,0.3)' }}>
              {evento.type}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 24px 0', color: '#EAF2FF', lineHeight: 1.2 }}>
            {evento.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', paddingBottom: '32px', borderBottom: '1px solid #11284A', marginBottom: '32px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ background: 'rgba(0, 85, 255, 0.1)', padding: '12px', borderRadius: '12px', color: '#00D9FF' }}>
                <Calendar size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4' }}>Data</p>
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#EAF2FF' }}>
                  {evento.eventDate ? new Date(evento.eventDate).toLocaleDateString('pt-BR') : evento.startDate ? new Date(evento.startDate).toLocaleDateString('pt-BR') : 'Data em breve'}
                </p>
              </div>
            </div>

            {(evento.eventTimeStart || evento.eventTimeEnd) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: 'rgba(0, 85, 255, 0.1)', padding: '12px', borderRadius: '12px', color: '#00D9FF' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4' }}>Horário</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#EAF2FF' }}>
                    {evento.eventTimeStart || ''} {evento.eventTimeEnd ? `às ${evento.eventTimeEnd}` : ''}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ background: 'rgba(0, 85, 255, 0.1)', padding: '12px', borderRadius: '12px', color: '#00D9FF' }}>
                <MapPin size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4' }}>Localização</p>
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#EAF2FF' }}>
                  {evento.modality === 'ONLINE' ? 'Evento Online' : evento.locationName || 'Local a definir'}
                </p>
                {evento.modality !== 'ONLINE' && evento.city && (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4' }}>{evento.city}, {evento.state}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginLeft: 'auto' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#8B9BB4', textAlign: 'right' }}>Investimento</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                  {evento.isFree ? 'Gratuito' : evento.price ? `R$ ${evento.price.toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
                </p>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
            
            {/* Esquerda: Sobre */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EAF2FF', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info className="text-blue-500" /> Sobre o Evento
              </h2>
              <div style={{ color: '#8B9BB4', lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                {evento.description || evento.longDescription || 'Nenhuma descrição fornecida.'}
              </div>
            </div>

            {/* Direita: Inscrição e Endereço */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Botão de Inscrição */}
              <div style={{ background: 'linear-gradient(to bottom, #061A32, #031225)', border: '1px solid #11284A', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700, color: '#EAF2FF' }}>Vagas Abertas</h3>
                {evento.registrationLink ? (
                  <a href={evento.registrationLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" style={{ width: '100%', padding: '24px 0', fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(90deg, #0055FF, #00D9FF)' }}>
                      Quero me Inscrever
                    </Button>
                  </a>
                ) : (
                  <Button variant="primary" style={{ width: '100%', padding: '24px 0', fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(90deg, #0055FF, #00D9FF)' }}>
                    Inscrever-se agora
                  </Button>
                )}
                <p style={{ margin: '16px 0 0 0', fontSize: '0.875rem', color: '#8B9BB4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle size={14} className="text-green-500" /> Vagas limitadas
                </p>
              </div>

              {/* Endereço Completo */}
              {evento.modality !== 'ONLINE' && evento.address && (
                <div style={{ background: '#061A32', border: '1px solid #11284A', padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: 700, color: '#EAF2FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map size={20} className="text-blue-500" /> Endereço Completo
                  </h3>
                  <div style={{ color: '#8B9BB4', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {evento.locationName && <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#EAF2FF' }}>{evento.locationName}</p>}
                    <p style={{ margin: 0 }}>{evento.address}{evento.number ? `, ${evento.number}` : ''}</p>
                    {evento.complement && <p style={{ margin: 0 }}>{evento.complement}</p>}
                    <p style={{ margin: 0 }}>{evento.neighborhood}</p>
                    <p style={{ margin: 0 }}>{evento.city} - {evento.state}</p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
