'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { getCompanyNotifications, markAsRead, markAllAsRead } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotificacoesEmpresaPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const data = await getCompanyNotifications()
      setNotifications(data)
    } catch (err) {
      toast.error('Erro ao carregar notificações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      toast.error('Erro ao marcar como lida.')
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Todas as notificações marcadas como lidas.')
    } catch (err) {
      toast.error('Erro ao atualizar notificações.')
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="text-green-500" size={20} />
      case 'WARNING': return <AlertTriangle className="text-yellow-500" size={20} />
      case 'ERROR': return <XCircle className="text-red-500" size={20} />
      case 'INFO': 
      default: return <Info className="text-blue-500" size={20} />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} />
            Notificações
          </h1>
          <p className="text-muted-foreground">
            Acompanhe alertas e atualizações importantes.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} className="flex items-center gap-2">
            <Check size={16} /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center p-12 text-muted-foreground animate-pulse">Carregando notificações...</div>
      ) : notifications.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <Bell size={48} className="text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-300">Tudo limpo!</h3>
            <p className="text-sm text-slate-500 mt-1">Sua caixa de notificações está vazia no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => { if (!notification.read) handleMarkAsRead(notification.id) }}
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                notification.read 
                  ? 'bg-slate-900/40 border-slate-800 opacity-70' 
                  : 'bg-slate-900 border-blue-900/50 shadow-md cursor-pointer hover:border-blue-800/80'
              }`}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
              )}
              
              <div className="mt-1 flex-shrink-0">
                {getIconForType(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`font-semibold text-sm ${notification.read ? 'text-slate-300' : 'text-slate-100'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className={`text-sm mt-1 ${notification.read ? 'text-slate-400' : 'text-slate-300'}`}>
                  {notification.message}
                </p>

                {notification.link && (
                  <div className="mt-3">
                    <Link href={notification.link}>
                      <Button variant="secondary" size="sm" className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-blue-400">
                        Visualizar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
