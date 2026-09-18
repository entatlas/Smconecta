'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function getVagas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!profile || profile.tipo !== 'ADMIN') {
    return []
  }

  const vagas = await prisma.job.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      modality: true,
      employmentType: true,
      company: {
        select: {
          companyName: true
        }
      },
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return vagas
}

export async function updateJobStatus(jobId: string, status: 'PUBLISHED' | 'PAUSED' | 'CLOSED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const adminProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!adminProfile || adminProfile.tipo !== 'ADMIN') {
    throw new Error('Acesso negado')
  }

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: { status }
  })

  return updatedJob
}

export async function deleteJob(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const adminProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!adminProfile || adminProfile.tipo !== 'ADMIN') {
    throw new Error('Acesso negado')
  }

  await prisma.job.delete({
    where: { id: jobId }
  })
  return { success: true }
}

export async function getCompaniesForSelect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const adminProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  if (!adminProfile || adminProfile.tipo !== 'ADMIN') return []

  return await prisma.company.findMany({
    select: {
      id: true,
      companyName: true,
    },
    orderBy: {
      companyName: 'asc'
    }
  })
}

export async function createVaga(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const adminProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  if (!adminProfile || adminProfile.tipo !== 'ADMIN') throw new Error('Acesso negado')

  const newJob = await prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      companyId: data.companyId,
      area: data.area,
      modality: data.modality,
      employmentType: data.employmentType,
      openings: parseInt(data.openings) || 1,
      salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
      salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
      salaryVisibility: data.salaryVisibility !== undefined ? data.salaryVisibility : true,
      state: data.state || null,
      city: data.city || null,
      schedule: data.schedule || null,
      status: data.status || 'PUBLISHED',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    }
  })

  return { success: true, jobId: newJob.id }
}
