'use client';

import React, { useEffect, useState } from 'react';
import { getMyNotifications, markAsRead, markAllAsRead } from './actions';
import { Bell, CheckCircle2, AlertCircle, Info, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificacoesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={24} color="#10b981" />;
      case 'WARNING': return <AlertCircle size={24} color="#f59e0b" />;
      case 'ERROR': return <AlertCircle size={24} color="#ef4444" />;
      default: return <Info size={24} color="#3b82f6" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={28} /> Central de Notificações
          </h1>
          <p style={{ color: '#94a3b8' }}>Você tem {unreadCount} notificações não lidas.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAll}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Check size={18} /> Marcar todas como lidas
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#fff' }}>Carregando...</p>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <Bell size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Tudo limpo por aqui!</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>Você não tem nenhuma notificação no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              style={{ 
                background: notification.read ? 'var(--color-surface)' : 'rgba(59, 130, 246, 0.05)', 
                border: `1px solid ${notification.read ? 'var(--color-border)' : 'rgba(59, 130, 246, 0.3)'}`, 
                borderRadius: '12px', 
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                {getIcon(notification.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{notification.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {notification.message}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {notification.link && (
                    <Link href={notification.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                      <ExternalLink size={16} /> Ver Detalhes
                    </Link>
                  )}
                  
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
