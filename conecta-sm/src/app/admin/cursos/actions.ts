'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!profile || profile.tipo !== 'ADMIN') throw new Error('Forbidden')
  
  return { user, profile }
}

export async function getCourses() {
  await requireAdminAuth()
  
  const courses = await prisma.course.findMany({
    where: { type: 'CURSO' },
    orderBy: { createdAt: 'desc' }
  })
  
  return courses
}

export async function getPublicCourses() {
  const courses = await prisma.course.findMany({
    where: { type: 'CURSO', status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' }
  })
  
  return courses
}

export async function upsertCourse(data: any) {
  await requireAdminAuth()

  let course;
  if (data.id) {
    course = await prisma.course.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl || null,
        registrationLink: data.registrationLink || null,
        status: data.status || 'PUBLISHED',
        modality: data.modality || 'Online',
        address: data.address || null,
        language: 'Português',
        price: data.price || 0,
        currency: data.currency || 'BRL',
        eventTimeStart: data.eventTimeStart || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        isFree: data.price ? false : true,
        type: 'CURSO'
      }
    })
  } else {
    course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl || null,
        registrationLink: data.registrationLink || null,
        status: data.status || 'PUBLISHED',
        modality: data.modality || 'Online',
        address: data.address || null,
        language: 'Português',
        price: data.price || 0,
        currency: data.currency || 'BRL',
        eventTimeStart: data.eventTimeStart || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        isFree: data.price ? false : true,
        type: 'CURSO'
      }
    })
  }

  revalidatePath('/admin/cursos')
  revalidatePath('/candidato/cursos')
  return course
}

export async function deleteCourse(id: string) {
  await requireAdminAuth()
  
  await prisma.course.delete({ where: { id } })
  
  revalidatePath('/admin/cursos')
  revalidatePath('/candidato/cursos')
  return { success: true }
}
