'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createEvento, updateEvento, getInstagramStatus, publishToInstagram } from '../actions'
import { Upload, Image as ImageIcon, MapPin, Share2, Calendar as CalendarIcon, Link as LinkIcon, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export function EventoForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('INFO') // INFO, FLYER, LOCAL, DIVULGACAO
  const [igConnected, setIgConnected] = useState(false)
  const [igUsername, setIgUsername] = useState('')
  const [publishingIg, setPublishingIg] = useState(false)
  const [customCaption, setCustomCaption] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'EVENTO',
    description: '',
    startDate: '',
    endDate: '',
    eventTimeStart: '',
    eventTimeEnd: '',
    status: 'DRAFT',
    isHighlighted: false,
    coverUrl: '',
    galleryUrls: [] as string[],
    locationName: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    modality: 'PRESENCIAL',
    registrationLink: '',
    workloadHours: '',
    level: '',
    instructorId: '',
  })

  // Gerar a legenda automaticamente com base nos dados
  const getGeneratedCaption = () => {
    let dateStr = 'Data em breve'
    if (formData.startDate) {
      const d = new Date(formData.startDate)
      dateStr = new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')
      if (formData.endDate) {
        const dEnd = new Date(formData.endDate)
        const endDateStr = new Date(dEnd.getTime() + dEnd.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')
        if (dateStr !== endDateStr) {
          dateStr = `${dateStr} a ${endDateStr}`
        }
      }
    }

    let timeStr = formData.eventTimeStart || ''
    if (formData.eventTimeStart && formData.eventTimeEnd) {
      timeStr = `${formData.eventTimeStart} às ${formData.eventTimeEnd}`
    }

    const localInfo = formData.modality === 'ONLINE' ? 'Evento Online' : (formData.city || formData.locationName || 'Local não informado')

    return `🎓 ${formData.title || 'Nome do Evento'}\n\n${formData.description ? `${formData.description}\n\n` : ''}📅 ${dateStr}\n⏰ ${timeStr}\n📍 ${localInfo}\n\nGaranta sua vaga!\nAcesse o link para inscrição.`
  }

  const generatedCaption = getGeneratedCaption()

  useEffect(() => {
    getInstagramStatus().then(res => {
      setIgConnected(res.connected)
      if (res.username) setIgUsername(res.username)
    })
    
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        workloadHours: initialData.workloadHours?.toString() || '',
        galleryUrls: initialData.galleryUrls || [],
      })
    }
  }, [initialData])

  const handlePublishIg = async () => {
    if (!initialData?.id) return toast.error('Salve o evento primeiro!')
    if (!formData.coverUrl) return toast.error('Faça upload de um flyer antes!')
    
    setPublishingIg(true)
    const toastId = toast.loading('Salvando fotos e postando no Instagram...')
    
    // Auto-save the event first to ensure database has the latest galleryUrls
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        workloadHours: formData.workloadHours ? parseInt(formData.workloadHours) : null,
      }
      await updateEvento(initialData.id, payload)
    } catch (e) {
      console.error('Erro ao auto-salvar:', e)
    }

    const captionToPublish = customCaption !== null ? customCaption : generatedCaption
    
    const res = await publishToInstagram(initialData.id, captionToPublish)
    setPublishingIg(false)
    
    if (res.success) {
      toast.success('Publicado no Instagram com sucesso!', { id: toastId })
    } else {
      toast.error(res.error || 'Erro ao publicar', { id: toastId })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files || files.length === 0) return
      
      const supabase = createClient()
      setUploading(true)
      const newUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error('Apenas arquivos JPG, PNG ou WEBP são permitidos')
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `eventos/${fileName}`

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

        newUrls.push(publicUrl)
      }

      setFormData(prev => {
        const updated = { ...prev }
        if (!updated.coverUrl && newUrls.length > 0) {
           updated.coverUrl = newUrls[0]
           updated.galleryUrls = [...updated.galleryUrls, ...newUrls.slice(1)]
        } else {
           updated.galleryUrls = [...updated.galleryUrls, ...newUrls]
        }
        return updated
      })

    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload das imagens')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => {
    setFormData(prev => {
      if (prev.coverUrl === url) {
        if (prev.galleryUrls.length > 0) {
          return {
            ...prev,
            coverUrl: prev.galleryUrls[0],
            galleryUrls: prev.galleryUrls.slice(1)
          }
        } else {
          return { ...prev, coverUrl: '' }
        }
      }
      return {
        ...prev,
        galleryUrls: prev.galleryUrls.filter(u => u !== url)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        workloadHours: formData.workloadHours ? parseInt(formData.workloadHours) : null,
      }

      let res
      if (initialData?.id) {
        res = await updateEvento(initialData.id, payload)
      } else {
        res = await createEvento(payload)
      }

      if (res.success) {
        toast.success(initialData ? 'Evento atualizado!' : 'Evento criado!')
        router.push('/admin/eventos')
        router.refresh()
      } else {
        throw new Error(res.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-6 w-full">
      {/* Sidebar / Tabs */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <Button variant={activeTab === 'INFO' ? 'primary' : 'outline'} onClick={() => setActiveTab('INFO')} className="justify-start border-slate-700 bg-slate-900 text-slate-300">
          <BookOpen size={16} className="mr-2" /> Principais
        </Button>
        <Button variant={activeTab === 'FLYER' ? 'primary' : 'outline'} onClick={() => setActiveTab('FLYER')} className="justify-start border-slate-700 bg-slate-900 text-slate-300">
          <ImageIcon size={16} className="mr-2" /> Flyer / Imagem
        </Button>
        <Button variant={activeTab === 'LOCAL' ? 'primary' : 'outline'} onClick={() => setActiveTab('LOCAL')} className="justify-start border-slate-700 bg-slate-900 text-slate-300">
          <MapPin size={16} className="mr-2" /> Localização
        </Button>
        <Button variant={activeTab === 'DIVULGACAO' ? 'primary' : 'outline'} onClick={() => setActiveTab('DIVULGACAO')} className="justify-start border-slate-700 bg-slate-900 text-slate-300 text-pink-400">
          <Share2 size={16} className="mr-2" /> Divulgação
        </Button>
      </div>

      {/* Content Form */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
          
          {activeTab === 'INFO' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">Informações Principais</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nome do Evento *</label>
                  <Input required name="title" value={formData.title} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Tipo *</label>
                  <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="EVENTO">Evento</SelectItem>
                      <SelectItem value="PALESTRA">Palestra</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="TREINAMENTO">Treinamento</SelectItem>
                      <SelectItem value="FEIRA">Feira</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Descrição</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="bg-slate-950 border-slate-800 text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Data de Início</label>
                  <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Data de Término (Opcional)</label>
                  <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200 [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Horário de Início</label>
                  <Input type="time" name="eventTimeStart" value={formData.eventTimeStart} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Horário de Término</label>
                  <Input type="time" name="eventTimeEnd" value={formData.eventTimeEnd} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200 [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Status</label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                      <SelectItem value="CLOSED">Encerrado</SelectItem>
                      <SelectItem value="CANCELED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input type="checkbox" id="isHighlighted" checked={formData.isHighlighted} onChange={(e) => handleCheckboxChange('isHighlighted', e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-900 accent-yellow-500" />
                  <label htmlFor="isHighlighted" className="text-sm font-medium text-slate-300 cursor-pointer">
                    Destacar este evento no site (Estrela)
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'FLYER' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-4">Mídia do Evento</h3>
                <p className="text-sm text-slate-400 mb-4">Faça upload da imagem principal (Capa) e de fotos adicionais para compor o Carrossel do Instagram (até 10 imagens no total).</p>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-8 bg-slate-800/50">
                  <div className="flex gap-4 flex-wrap mb-6 justify-center">
                    {formData.coverUrl && (
                      <div className="relative group w-32 h-32">
                        <Image src={formData.coverUrl} alt="Capa" fill className="object-cover rounded-md border-2 border-pink-500" />
                        <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-2 py-1 rounded shadow">Capa</div>
                        <button type="button" onClick={() => removeImage(formData.coverUrl)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {formData.galleryUrls.map((url, idx) => (
                      <div key={idx} className="relative group w-32 h-32">
                        <Image src={url} alt={`Galeria ${idx}`} fill className="object-cover rounded-md border border-slate-600" />
                        <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-md transition-colors flex items-center gap-2">
                    {uploading ? 'Enviando...' : 'Selecionar Imagens'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading || (formData.galleryUrls.length + (formData.coverUrl ? 1 : 0)) >= 10}
                    />
                  </label>
                  {((formData.galleryUrls.length + (formData.coverUrl ? 1 : 0)) >= 10) && (
                    <p className="text-xs text-red-400 mt-2">Limite máximo de 10 imagens atingido.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LOCAL' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">Localização e Inscrição</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Modalidade</label>
                <Select value={formData.modality} onValueChange={(v) => handleSelectChange('modality', v)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.modality !== 'ONLINE' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nome do Local (Ex: Centro de Formação SM)</label>
                    <Input name="locationName" value={formData.locationName} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-300">Endereço</label>
                      <Input name="address" value={formData.address} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Número</label>
                      <Input name="number" value={formData.number} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Bairro</label>
                      <Input name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Cidade</label>
                      <Input name="city" value={formData.city} onChange={handleChange} className="bg-slate-950 border-slate-800 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Estado</label>
                      <Input name="state" value={formData.state} onChange={handleChange} maxLength={2} className="bg-slate-950 border-slate-800 text-slate-200" />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 space-y-2">
                <label className="text-sm font-medium text-slate-300">Link de Inscrição / Transmissão Externo</label>
                <div className="flex relative items-center">
                  <LinkIcon size={16} className="absolute left-3 text-slate-500" />
                  <Input name="registrationLink" value={formData.registrationLink} onChange={handleChange} placeholder="https://..." className="pl-10 bg-slate-950 border-slate-800 text-slate-200" />
                </div>
                <p className="text-xs text-slate-500">Se preenchido, o botão "Quero me Inscrever" redirecionará para este link.</p>
              </div>
            </div>
          )}

          {activeTab === 'DIVULGACAO' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2"><Share2 className="text-pink-500" /> Divulgação no Instagram</h2>
              
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex gap-6">
                <div className="w-1/3 border border-slate-800 rounded-lg p-2 bg-black flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 p-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">SM</div>
                      <span className="text-sm font-semibold text-white">Conecta SM</span>
                    </div>
                    {formData.coverUrl ? (
                      <div className="relative w-full aspect-square">
                        <Image src={formData.coverUrl} alt="cover" fill className="object-cover rounded" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-slate-900 flex items-center justify-center text-slate-600 rounded">Sem imagem</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 flex justify-between">
                      Legenda Sugerida Automática
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-blue-400 hover:text-blue-300 p-0" onClick={() => setCustomCaption(null)} disabled={customCaption === null}>
                        Restaurar Padrão
                      </Button>
                    </label>
                    <Textarea 
                      className="bg-slate-900 border-slate-800 text-slate-300 mt-2 font-mono text-sm h-48 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      value={customCaption !== null ? customCaption : generatedCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded border border-slate-800 flex flex-col gap-4">
                    {!igConnected ? (
                      <div className="flex flex-col gap-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded text-sm text-yellow-200">
                          <h4 className="font-bold mb-2 flex items-center gap-2">⚠️ Conexão Necessária (Passo a Passo)</h4>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Acesse <a href="https://developers.facebook.com" target="_blank" className="underline text-yellow-400">developers.facebook.com</a> com o perfil dono da página do Conecta SM.</li>
                            <li>Crie um App (Tipo: Negócios).</li>
                            <li>Adicione o produto "Login do Facebook para Empresas" e "API do Instagram Graph".</li>
                            <li>Nas configurações do Login, adicione a URL de redirecionamento: <br/> <code className="bg-black/50 px-1 rounded">http://localhost:3000/api/instagram/callback</code></li>
                            <li>Pegue o <strong>App ID</strong> e <strong>App Secret</strong> e coloque no arquivo <code>.env</code> do projeto.</li>
                            <li>Clique no botão abaixo para autorizar.</li>
                          </ol>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" onClick={() => {
                            navigator.clipboard.writeText(`🎓 ${formData.title}\n\n📅 ${formData.startDate ? new Date(formData.startDate).toLocaleDateString('pt-BR') : 'Data em breve'}\n⏰ ${formData.eventTimeStart || ''}\n📍 ${formData.modality === 'ONLINE' ? 'Evento Online' : formData.city || 'Local'}\n\nGaranta sua vaga!\nAcesse o link para inscrição.`)
                            toast.success('Legenda copiada!')
                          }}>
                            Apenas Copiar Legenda
                          </Button>
                          <a href="/api/instagram/auth">
                            <Button type="button" variant="default" className="bg-pink-600 hover:bg-pink-700 text-white">
                              Conectar Instagram
                            </Button>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-green-500/10 border border-green-500/50 p-4 rounded flex items-center justify-between gap-2 text-green-400 font-medium">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={20} /> Instagram Conectado! {igUsername ? `(@${igUsername})` : ''}
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                            onClick={async () => {
                              const { disconnectInstagram } = await import('../actions');
                              await disconnectInstagram();
                              setIgConnected(false);
                              setIgUsername('');
                              toast.success('Instagram desconectado');
                            }}
                          >
                            Desconectar
                          </Button>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="default" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 border-none font-bold" onClick={handlePublishIg} disabled={publishingIg || !initialData}>
                            {publishingIg ? 'Publicando...' : 'Publicar Agora no Feed'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 flex justify-end gap-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
