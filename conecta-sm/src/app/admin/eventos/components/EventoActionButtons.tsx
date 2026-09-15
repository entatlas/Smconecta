'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Play, Pause, XCircle, FileEdit, Copy, Trash2, Share2 } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateEvento, deleteEvento, duplicateEvento, publishToInstagram } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export function EventoActionButtons({ eventoId, currentStatus }: { eventoId: string, currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmIgOpen, setConfirmIgOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    const res = await updateEvento(eventoId, { status: newStatus })
    setLoading(false)
    if (res.success) {
      toast.success(`Evento atualizado para ${newStatus}`)
      router.refresh()
    } else {
      toast.error('Erro ao atualizar evento')
    }
  }

  async function handleDelete() {
    setLoading(true)
    const res = await deleteEvento(eventoId)
    setLoading(false)
    if (res.success) {
      toast.success('Evento excluído com sucesso')
      router.refresh()
    } else {
      toast.error('Erro ao excluir evento')
    }
  }

  async function handleDuplicate() {
    setLoading(true)
    const res = await duplicateEvento(eventoId)
    setLoading(false)
    if (res.success) {
      toast.success('Evento duplicado com sucesso')
      router.refresh()
    } else {
      toast.error('Erro ao duplicar evento')
    }
  }

  async function handlePublishIg() {
    setLoading(true)
    const toastId = toast.loading('Postando no Instagram... Isso pode levar alguns segundos.')
    
    const res = await publishToInstagram(eventoId)
    setLoading(false)
    if (res.success) {
      toast.success('Publicado no Instagram com sucesso!', { id: toastId })
    } else {
      toast.error(res.error || 'Erro ao publicar no Instagram', { id: toastId })
    }
  }

  return (
    <div className="flex gap-2 w-full">
      <Link href={`/admin/eventos/${eventoId}`} className="flex-1">
        <Button variant="outline" className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200">
          <FileEdit size={16} className="mr-2" /> Editar
        </Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-10 px-0 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200" disabled={loading}>
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
          <DropdownMenuLabel>Ações do Evento</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          
          <DropdownMenuItem onClick={() => setConfirmIgOpen(true)} className="cursor-pointer hover:bg-slate-800 text-pink-500">
            <Share2 size={14} className="mr-2" /> Postar no Instagram
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-800" />

          {currentStatus === 'DRAFT' && (
            <DropdownMenuItem onClick={() => handleStatusChange('PUBLISHED')} className="cursor-pointer hover:bg-slate-800">
              <Play size={14} className="mr-2 text-green-400" /> Publicar
            </DropdownMenuItem>
          )}
          {currentStatus === 'PUBLISHED' && (
            <DropdownMenuItem onClick={() => handleStatusChange('DRAFT')} className="cursor-pointer hover:bg-slate-800">
              <Pause size={14} className="mr-2 text-yellow-400" /> Despublicar
            </DropdownMenuItem>
          )}
          {currentStatus !== 'CANCELED' && (
            <DropdownMenuItem onClick={() => handleStatusChange('CANCELED')} className="cursor-pointer hover:bg-slate-800 text-red-400">
              <XCircle size={14} className="mr-2" /> Cancelar Evento
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-slate-800" />
          
          <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer hover:bg-slate-800">
            <Copy size={14} className="mr-2" /> Duplicar
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="cursor-pointer hover:bg-slate-800 text-red-500">
            <Trash2 size={14} className="mr-2" /> Excluir permanentemente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmIgOpen} onOpenChange={setConfirmIgOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle>Postar no Instagram</DialogTitle>
            <DialogDescription className="text-slate-400">
              Deseja realmente postar este evento no Instagram agora? Essa ação publicará a capa (e a galeria, se houver) na conta conectada ao Conecta SM.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setConfirmIgOpen(false)} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
            <Button variant="default" onClick={() => { setConfirmIgOpen(false); handlePublishIg(); }} disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white border-none shadow-lg shadow-pink-600/20">Postar Agora</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-red-400">Excluir Evento</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja excluir permanentemente este evento? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
            <Button variant="destructive" onClick={() => { setConfirmDeleteOpen(false); handleDelete(); }} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
