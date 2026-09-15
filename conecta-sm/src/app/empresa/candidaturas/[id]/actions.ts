'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

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

export async function getApplicationDetails(applicationId: string) {
  const { companyId } = await requireCompanyAuth()

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      history: { orderBy: { createdAt: 'desc' } },
      candidate: {
        include: {
          profile: true,
          experiences: true,
          education: true,
          languages: true,
          skills: true,
          courses: true,
        }
      }
    }
  })

  if (!application || application.job.companyId !== companyId) {
    throw new Error('Candidatura não encontrada ou sem permissão de acesso.')
  }

  // Fetch negative history globally for this candidate
  const negativeHistory = await prisma.application.findMany({
    where: {
      candidateId: application.candidateId,
      status: { in: ['NO_SHOW', 'FIRED'] },
      id: { not: application.id } // exclude current application
    },
    select: {
      status: true,
      job: { select: { title: true } },
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  return { ...application, negativeHistory }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const { companyId, profile } = await requireCompanyAuth()

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true }
  })

  if (!application || application.job.companyId !== companyId) {
    throw new Error('Candidatura não encontrada ou sem permissão.')
  }

  const oldStatus = application.status

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  })

  await prisma.applicationHistory.create({
    data: {
      applicationId,
      oldStatus,
      newStatus,
      changedBy: profile.id
    }
  })

  return updated
}

export async function addInternalNote(applicationId: string, text: string) {
  const { companyId, profile } = await requireCompanyAuth()

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true }
  })

  if (!application || application.job.companyId !== companyId) {
    throw new Error('Sem permissão.')
  }

  const currentNotes: any[] = Array.isArray(application.internalNotes) ? application.internalNotes : []
  currentNotes.push({
    text,
    date: new Date().toISOString(),
    authorId: profile.id,
    authorName: profile.nome
  })

  return prisma.application.update({
    where: { id: applicationId },
    data: { internalNotes: currentNotes }
  })
}

export async function scheduleInterview(data: {
  applicationId: string, candidateId: string, jobId: string, 
  date: string, time: string, duration: number, type: string, locationOrLink?: string, notes?: string
}) {
  const { companyId, profile } = await requireCompanyAuth()

  const interview = await (prisma as any).interview.create({
    data: {
      companyId,
      candidateId: data.candidateId,
      jobId: data.jobId,
      applicationId: data.applicationId,
      date: new Date(data.date),
      time: data.time,
      duration: data.duration,
      type: data.type,
      locationOrLink: data.locationOrLink,
      notes: data.notes
    }
  })

  // Alterar o status da candidatura para INTERVIEW
  await updateApplicationStatus(data.applicationId, 'INTERVIEW')

  // Buscar application para pegar dados para o email
  const application = await prisma.application.findUnique({
    where: { id: data.applicationId },
    include: {
      job: true,
      candidate: { include: { profile: true } }
    }
  })

  if (application && application.candidate.profile.email) {
    const { dispatchEvent } = await import('@/lib/events/EventDispatcher');
    await dispatchEvent('INTERVIEW_SCHEDULED', {
      candidateEmail: application.candidate.profile.email,
      candidateName: application.candidate.profile.nome,
      jobTitle: application.job.title,
      companyName: profile.companyProfile?.companyName || 'Empresa',
      date: new Date(data.date).toLocaleDateString('pt-BR'),
      time: data.time,
      locationOrLink: data.locationOrLink || 'Local não informado'
    });
  }

  return interview
}
