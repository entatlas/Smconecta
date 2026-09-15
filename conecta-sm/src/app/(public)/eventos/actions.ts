'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicEventos() {
  try {
    const eventos = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: [
        { isHighlighted: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    return eventos
  } catch (error) {
    console.error('Erro ao buscar eventos publicos:', error)
    return []
  }
}

export async function getPublicEventoById(id: string) {
  try {
    const evento = await prisma.course.findFirst({
      where: {
        id,
        status: 'PUBLISHED'
      }
    })
    return evento
  } catch (error) {
    console.error('Erro ao buscar evento publico:', error)
    return null
  }
}
