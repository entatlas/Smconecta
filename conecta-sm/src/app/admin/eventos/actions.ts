'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!profile || profile.tipo !== 'ADMIN') {
    throw new Error('Acesso negado')
  }
  return profile
}

export async function getEventos() {
  try {
    await checkAdminAuth()
    const eventos = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return eventos
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return []
  }
}

export async function getEventoById(id: string) {
  try {
    await checkAdminAuth()
    const evento = await prisma.course.findUnique({
      where: { id }
    })
    return evento
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return null
  }
}

export async function createEvento(data: any) {
  try {
    await checkAdminAuth()
    
    // Normalize data
    if (data.type !== 'CURSO') {
      data.workloadHours = null
      data.instructorId = null
      data.level = null
    }

    // Remover campos que não podem ser criados diretamente (como id gerado, etc)
    const { 
      id: _id, 
      createdAt, 
      updatedAt, 
      modules, 
      enrollments, 
      assessments, 
      certificates, 
      financialTransactions, 
      professionalAreaId,
      instructorId,
      categoryId,
      ...createData 
    } = data

    const evento = await prisma.course.create({
      data: {
        ...createData
      }
    })
    return { success: true, evento }
  } catch (error: any) {
    console.error('Erro ao criar evento:', error)
    return { success: false, error: error.message }
  }
}

export async function updateEvento(id: string, data: any) {
  try {
    await checkAdminAuth()

    if (data.type !== 'CURSO') {
      data.workloadHours = null
      data.instructorId = null
      data.level = null
    }

    // Remover campos que não podem ser atualizados diretamente
    const { 
      id: _id, 
      createdAt, 
      updatedAt, 
      modules, 
      enrollments, 
      assessments, 
      certificates, 
      financialTransactions, 
      professionalAreaId,
      instructorId,
      categoryId,
      ...updateData 
    } = data

    // Prisma update requirement for scalar lists
    if (updateData.galleryUrls && Array.isArray(updateData.galleryUrls)) {
      updateData.galleryUrls = { set: updateData.galleryUrls }
    }

    const evento = await prisma.course.update({
      where: { id },
      data: {
        ...updateData
      }
    })
    return { success: true, evento }
  } catch (error: any) {
    console.error('Erro ao atualizar evento:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteEvento(id: string) {
  try {
    await checkAdminAuth()
    await prisma.course.delete({
      where: { id }
    })
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar evento:', error)
    return { success: false, error: error.message }
  }
}

export async function duplicateEvento(id: string) {
  try {
    await checkAdminAuth()
    const original = await prisma.course.findUnique({
      where: { id }
    })
    if (!original) throw new Error('Evento original não encontrado')

    // Prepare data by stripping unique/system fields
    const { id: _, createdAt, updatedAt, status, ...cloneData } = original

    const newEvento = await prisma.course.create({
      data: {
        ...cloneData,
        title: `${original.title} (Cópia)`,
        status: 'DRAFT',
      }
    })
    return { success: true, evento: newEvento }
  } catch (error: any) {
    console.error('Erro ao duplicar evento:', error)
    return { success: false, error: error.message }
  }
}

export async function getInstagramStatus() {
  try {
    const integration = await prisma.platformIntegration.findUnique({
      where: { provider: 'INSTAGRAM' }
    })
    
    if (!integration || !integration.accessToken || !integration.accountId) {
      return { connected: false }
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${integration.accountId}?fields=username&access_token=${integration.accessToken}`);
      const data = await res.json();
      if (data.username) {
        return { connected: true, username: data.username };
      }
    } catch(e) {
      console.error('Erro ao buscar username do Instagram:', e);
    }

    return { connected: true };
  } catch (error) {
    return { connected: false }
  }
}

export async function publishToInstagram(eventoId: string, customCaption?: string) {
  try {
    await checkAdminAuth()

    const evento = await prisma.course.findUnique({
      where: { id: eventoId }
    })

    if (!evento || !evento.coverUrl) {
      throw new Error('Evento não encontrado ou sem Flyer/Imagem de capa.')
    }

    // Resolver problema de fuso horário ao criar a data
    let dateStr = 'Data em breve'
    if (evento.startDate) {
      const d = new Date(evento.startDate)
      dateStr = new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')
      if (evento.endDate) {
        const dEnd = new Date(evento.endDate)
        const endDateStr = new Date(dEnd.getTime() + dEnd.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR')
        if (dateStr !== endDateStr) {
          dateStr = `${dateStr} a ${endDateStr}`
        }
      }
    }

    let timeStr = evento.eventTimeStart || ''
    if (evento.eventTimeStart && evento.eventTimeEnd) {
      timeStr = `${evento.eventTimeStart} às ${evento.eventTimeEnd}`
    }

    const localInfo = evento.modality === 'ONLINE' ? 'Evento Online' : (evento.city ? `${evento.city}` : (evento.locationName || 'Local não informado'))

    const caption = customCaption || `🎓 ${evento.title || 'Nome do Evento'}\n\n${evento.description ? `${evento.description}\n\n` : ''}📅 ${dateStr}\n⏰ ${timeStr}\n📍 ${localInfo}\n\nGaranta sua vaga!\nAcesse o link para inscrição.`

    const integration = await prisma.platformIntegration.findUnique({
      where: { provider: 'INSTAGRAM' }
    })

    if (!integration || !integration.accessToken || !integration.accountId) {
      throw new Error('Instagram não conectado na plataforma.')
    }

    const allImages = [evento.coverUrl, ...(evento.galleryUrls || [])].filter(Boolean) as string[]
    let creationId = ''

    if (allImages.length > 1) {
      // Fluxo de Carrossel
      const childrenIds: string[] = []
      
      for (const imgUrl of allImages) {
        const itemRes = await fetch(`https://graph.facebook.com/v19.0/${integration.accountId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imgUrl,
            is_carousel_item: true,
            access_token: integration.accessToken
          })
        })
        const itemData = await itemRes.json()
        if (itemData.error) throw new Error(itemData.error.message || 'Erro ao preparar item do carrossel.')
        childrenIds.push(itemData.id)
      }

      // Criar o container do carrossel
      const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${integration.accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          children: childrenIds,
          caption: caption,
          access_token: integration.accessToken
        })
      })
      const carouselData = await carouselRes.json()
      if (carouselData.error) throw new Error(carouselData.error.message || 'Erro ao criar carrossel.')
      creationId = carouselData.id

    } else {
      // Fluxo de Imagem Única
      const mediaResponse = await fetch(`https://graph.facebook.com/v19.0/${integration.accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: evento.coverUrl,
          caption: caption,
          access_token: integration.accessToken
        })
      })

      const mediaData = await mediaResponse.json()
      if (mediaData.error) {
        console.error('Erro ao criar media no IG:', mediaData.error)
        throw new Error(mediaData.error.message || 'Erro ao preparar a imagem no Instagram.')
      }
      creationId = mediaData.id
    }

    // 2. Publicar o Container
    const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${integration.accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: integration.accessToken
      })
    })

    const publishData = await publishResponse.json()
    if (publishData.error) {
      console.error('Erro ao publicar media no IG:', publishData.error)
      throw new Error(publishData.error.message || 'Erro ao publicar no Instagram.')
    }

    return { success: true, instagramPostId: publishData.id }

  } catch (error: any) {
    console.error('Erro na ação publishToInstagram:', error)
    return { success: false, error: error.message }
  }
}

import { revalidatePath } from 'next/cache';

export async function disconnectInstagram() {
  try {
    await checkAdminAuth()
    await prisma.platformIntegration.deleteMany({
      where: { provider: 'INSTAGRAM' }
    })
    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao desconectar Instagram:', error)
    return { success: false, error: error.message }
  }
}
