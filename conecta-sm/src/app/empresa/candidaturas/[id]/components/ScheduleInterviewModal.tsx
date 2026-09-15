'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { scheduleInterview } from '../actions'

export function ScheduleInterviewModal({ 
  isOpen, onClose, applicationId, candidateId, jobId, onScheduled 
}: { 
  isOpen: boolean, onClose: () => void, applicationId: string, candidateId: string, jobId: string, onScheduled: () => void 
}) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'ONLINE',
    locationOrLink: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await scheduleInterview({
        applicationId,
        candidateId,
        jobId,
        ...formData
      })
      toast.success('Entrevista agendada com sucesso!')
      onScheduled()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao agendar entrevista.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Marcar Entrevista</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Data</label>
              <Input 
                type="date" 
                required 
                className="bg-slate-950 border-slate-800"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Horário</label>
              <Input 
                type="time" 
                required 
                className="bg-slate-950 border-slate-800"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tipo</label>
              <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="IN_PERSON">Presencial</SelectItem>
                  <SelectItem value="PHONE">Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Duração (minutos)</label>
              <Input 
                type="number" 
                required 
                min={15}
                className="bg-slate-950 border-slate-800"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Local ou Link da Reunião</label>
            <Input 
              type="text" 
              placeholder="Ex: Link do Google Meet, Endereço..."
              className="bg-slate-950 border-slate-800"
              value={formData.locationOrLink}
              onChange={e => setFormData({ ...formData, locationOrLink: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Observações para o candidato</label>
            <Textarea 
              placeholder="Ex: Instruções de acesso, o que preparar..."
              className="bg-slate-950 border-slate-800 text-sm"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              Agendar Entrevista
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
