'use server'

import { prisma } from '@/lib/prisma';

import { PrismaClient } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
import { logAuditAction } from '@/lib/api/audit'


async function requireCompanyAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  })

  if (!profile || !profile.companyProfile) throw new Error('Forbidden')
  
  return { user, profile, companyId: profile.companyProfile.id }
}

export async function getCompanyCandidates(page = 1, limit = 20, search = '') {
  const { companyId } = await requireCompanyAuth()

  // Buscar todas as candidaturas desta empresa para listar os candidatos.
  // IMPORTANTE: Isso previne que a empresa veja candidatos que nunca aplicaram para ela.
  
  const whereApp: any = { job: { companyId } }
  if (search) {
    whereApp.candidate = {
      profile: { nome: { contains: search, mode: 'insensitive' } }
    }
  }

  const skip = (page - 1) * limit
  
  // Pegar candidatos únicos
  const applications = await prisma.application.findMany({
    where: whereApp,
    skip,
    take: limit,
    orderBy: { appliedAt: 'desc' },
    include: {
      candidate: {
        include: {
          profile: { select: { nome: true, email: true, telefone: true, avatar_url: true } },
          skills: true,
          experiences: { orderBy: { startDate: 'desc' } },
          education: { orderBy: { startDate: 'desc' } },
          languages: true,
          courses: { orderBy: { endDate: 'desc' } }
        }
      },
      job: { select: { title: true } }
    }
  })

  const total = await prisma.application.count({ where: whereApp })

  const candidates = applications.map(app => {
    return {
      applicationId: app.id,
      candidateId: app.candidate.id,
      name: app.candidate.profile.nome,
      email: app.candidate.profile.email,
      phone: app.candidate.profile.telefone,
      avatarUrl: app.candidate.profile.avatar_url,
      city: app.candidate.city,
      state: app.candidate.state,
      headline: app.candidate.headline,
      about: app.candidate.about,
      jobTitle: app.job.title,
      status: app.status,
      appliedAt: app.appliedAt,
      resumeUrl: app.candidate.resumeUrl,
      skills: app.candidate.skills,
      experiences: app.candidate.experiences,
      education: app.candidate.education,
      languages: app.candidate.languages,
      courses: app.candidate.courses
    }
  })

  return {
    candidates,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const { companyId, profile } = await requireCompanyAuth()

  // Verifica se a aplicação pertence a uma vaga da empresa
  const app = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId } }
  })

  if (!app) throw new Error('Candidatura não encontrada ou sem acesso.')

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  })

  await logAuditAction({
    profileId: profile.id,
    action: 'APPLICATION_STATUS_UPDATED',
    entityType: 'APPLICATION',
    entityId: app.id,
    oldData: { status: app.status },
    newData: { status: newStatus }
  })

  return updated
}
