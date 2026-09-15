import React from 'react'
import { Bell } from 'lucide-react'

export default function NotificacoesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: '#EAF2FF' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bell size={24} color="#00D9FF" /> Notificações
      </h1>
      <p style={{ color: '#9BAFC8', marginBottom: '2rem' }}>Atualizações sobre suas candidaturas e oportunidades.</p>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#061A32', borderRadius: '12px', border: '1px dashed rgba(0, 140, 255, 0.3)' }}>
        <Bell size={48} color="#00D9FF" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h3 style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>Nenhuma notificação</h3>
        <p style={{ color: '#9BAFC8', fontSize: '0.9rem' }}>Você está em dia! Novas notificações aparecerão aqui.</p>
      </div>
    </div>
  )
}
