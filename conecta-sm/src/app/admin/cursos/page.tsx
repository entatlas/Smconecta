'use client'

import React, { useState, useEffect } from 'react'

import { getCourses, upsertCourse, deleteCourse } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function AdminCursosVitrinePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    registrationLink: '',
    price: '' as string | number,
    currency: 'BRL',
    status: 'PUBLISHED',
    modality: 'Online',
    address: '',
    eventTimeStart: '',
    startDate: ''
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (e: any) {
      toast.error('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course.id)
    setFormData({
      title: course.title,
      description: course.description || '',
      coverUrl: course.coverUrl || '',
      registrationLink: course.registrationLink || '',
      price: course.price || '',
      currency: course.currency || 'BRL',
      status: course.status || 'PUBLISHED',
      modality: course.modality || 'Online',
      address: course.address || '',
      eventTimeStart: course.eventTimeStart || '',
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : ''
    })
  }

  const handleNew = () => {
    setEditingCourse('NEW')
    setFormData({
      title: '',
      description: '',
      coverUrl: '',
      registrationLink: '',
      price: '',
      currency: 'BRL',
      status: 'PUBLISHED',
      modality: 'Online',
      address: '',
      eventTimeStart: '',
      startDate: ''
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Apenas arquivos JPG, PNG ou WEBP são permitidos')
        return
      }

      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `cursos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, coverUrl: publicUrl }))
      toast.success('Imagem carregada com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao fazer upload da imagem')
      console.error(error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertCourse({
        id: editingCourse === 'NEW' ? undefined : editingCourse,
        ...formData,
        price: formData.price === '' ? 0 : parseFloat(String(formData.price))
      })
      toast.success('Curso salvo na vitrine com sucesso!')
      setEditingCourse(null)
      loadCourses()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar curso')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este curso da vitrine?')) return
    try {
      await deleteCourse(id)
      toast.success('Curso removido da vitrine.')
      loadCourses()
    } catch (e: any) {
      toast.error('Erro ao excluir curso')
    }
  }

  if (loading) return <div className="p-8 text-white">Carregando...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vitrine de Cursos</h1>
          <p className="text-slate-400">Gerencie os cursos externos (ex: Hotmart) que aparecem para os candidatos.</p>
        </div>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Curso
        </Button>
      </div>

      {editingCourse && (
        <Card className="bg-slate-900 border-slate-800 mb-8 p-6">
          <CardTitle className="text-xl mb-4 text-white">
            {editingCourse === 'NEW' ? 'Adicionar Curso à Vitrine' : 'Editar Curso'}
          </CardTitle>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Título do Curso"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300 font-semibold block">Preço (Opcional - Deixe vazio se for Grátis)</label>
              <div className="flex items-center gap-2">
                <select 
                  className="bg-slate-800 border border-slate-700 text-white rounded p-2 h-[42px] w-24"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="BRL">R$</option>
                  <option value="USD">US$</option>
                  <option value="EUR">€</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  className="bg-slate-800 border border-slate-700 text-white rounded p-2 h-[42px] flex-1 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300 font-semibold block">Breve Descrição do Curso</label>
              <textarea
                className="bg-slate-800 border border-slate-700 text-white rounded p-3 min-h-[100px] w-full focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 font-semibold mb-1 block">Imagem de Capa</label>
                <div className="flex gap-4 items-center">
                  {formData.coverUrl && (
                    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                      <Image src={formData.coverUrl} alt="Capa" fill className="rounded object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white p-3 rounded flex items-center gap-2 border border-slate-700 flex-1 justify-center transition-colors">
                    <UploadCloud size={20} />
                    {uploadingImage ? 'Enviando...' : 'Fazer Upload (JPG, PNG)'}
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <Input
                label="Link de Checkout/Venda (Hotmart, etc)"
                placeholder="https://pay.hotmart.com/..."
                value={formData.registrationLink}
                onChange={e => setFormData({ ...formData, registrationLink: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4 mt-4">
              <div className="flex flex-col gap-1 w-1/3">
                <label className="text-sm text-slate-300 font-semibold block">Modalidade</label>
                <select 
                  className="bg-slate-800 border border-slate-700 text-white rounded p-2 h-[42px]"
                  value={formData.modality}
                  onChange={e => setFormData({ ...formData, modality: e.target.value })}
                >
                  <option value="Online">Online</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm text-slate-300 font-semibold block">Status na Vitrine</label>
                <select 
                  className="bg-slate-800 border border-slate-700 text-white rounded p-2 h-[42px]"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PUBLISHED">Publicado (Visível)</option>
                  <option value="DRAFT">Rascunho (Oculto)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <Input
                  label="Data de Início (Opcional)"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Horário (Opcional - Ex: 19:00)"
                  placeholder="Deixe em branco se for gravado/sem hora"
                  value={formData.eventTimeStart}
                  onChange={e => setFormData({ ...formData, eventTimeStart: e.target.value })}
                />
              </div>
            </div>

            {formData.modality !== 'Online' && (
              <Input
                label="Endereço do Local (Obrigatório para Presencial/Híbrido)"
                placeholder="Ex: Rua das Flores, 123, São Paulo - SP"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Salvar Curso
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map(course => (
          <Card key={course.id} className="bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
            <div className="h-40 bg-slate-800 relative">
              {course.coverUrl ? (
                <Image src={course.coverUrl} alt={course.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${course.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {course.status === 'PUBLISHED' ? 'Visível' : 'Oculto'}
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2 text-white">{course.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-emerald-400">
                  {course.price > 0 ? `${course.currency === 'BRL' ? 'R$' : course.currency === 'USD' ? 'US$' : '€'} ${course.price}` : 'Grátis / Consulte'}
                </span>
                {course.registrationLink && (
                  <a href={course.registrationLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    Link Hotmart <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800">
                <Button variant="outline" className="flex-1 text-xs h-8" onClick={() => handleEdit(course)}>
                  <Edit2 className="w-3 h-3 mr-2" /> Editar
                </Button>
                <Button variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && !editingCourse && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            Nenhum curso adicionado à vitrine. Clique em "Adicionar Curso" para começar.
          </div>
        )}
      </div>
    </div>
  )
}
