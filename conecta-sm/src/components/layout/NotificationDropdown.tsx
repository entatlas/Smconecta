'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Settings, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getMyNotifications, markAsRead, markAllAsRead, createTestNotification } from '@/app/notificacoes/actions';
import { toast } from 'sonner';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll a cada 60 segundos
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Todas lidas!');
    } catch (err) {
      toast.error('Erro ao marcar tudo como lido');
    }
  };

  const handleCreateTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Previne fechar o dropdown
    try {
      await createTestNotification();
      toast.success('Notificação gerada!');
      fetchNotifications();
    } catch (err) {
      toast.error('Erro ao gerar notificação');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button style={{
          position: 'relative',
          padding: '0.5rem',
          color: 'var(--color-text-secondary)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-subtle, var(--color-bg-main))',
          border: 'none',
          cursor: 'pointer',
          lineHeight: 0,
        }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--color-error)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center p-4 pb-2">
          <span>Notificações</span>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateTest}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
              title="Gerar Notificação de Teste"
            >
              <PlusCircle size={12} /> Teste
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação encontrada.</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={`flex flex-col items-start p-4 cursor-pointer gap-1 ${!n.read ? 'bg-accent/50' : ''}`}
                onClick={() => {
                  if (!n.read) handleMarkAsRead(n.id);
                  if (n.link) window.location.href = n.link;
                }}
              >
                <div className="flex w-full justify-between items-start gap-2">
                  <span className={`font-semibold text-sm ${!n.read ? 'text-primary' : ''}`}>
                    {n.title}
                  </span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {n.message}
                </span>
                <span className="text-[10px] text-muted-foreground/70 mt-1">
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(n.createdAt))}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
