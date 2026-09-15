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

export async function getCompanyInterviews() {
  const { companyId } = await requireCompanyAuth()

  const interviews = await (prisma as any).interview.findMany({
    where: { companyId },
    orderBy: { date: 'asc' },
    include: {
      candidate: {
        include: { profile: true }
      },
      job: { select: { title: true } }
    }
  })

  return interviews
}

export async function updateInterviewStatus(interviewId: string, status: string) {
  const { companyId } = await requireCompanyAuth()

  const interview = await (prisma as any).interview.findFirst({
    where: { id: interviewId, companyId }
  })

  if (!interview) throw new Error('Entrevista não encontrada')

  return (prisma as any).interview.update({
    where: { id: interviewId },
    data: { status }
  })
}

export async function updateInterviewDate(interviewId: string, date: Date, time: string) {
  const { companyId } = await requireCompanyAuth()

  const interview = await (prisma as any).interview.findFirst({
    where: { id: interviewId, companyId }
  })

  if (!interview) throw new Error('Entrevista não encontrada')

  return (prisma as any).interview.update({
    where: { id: interviewId },
    data: { date, time }
  })
}

export async function getCompanyApplicationsForAgenda() {
  const { companyId } = await requireCompanyAuth()

  const applications = await (prisma as any).application.findMany({
    where: { 
      job: { companyId },
      status: { notIn: ['REJECTED', 'WITHDRAWN', 'HIRED', 'APPROVED'] } 
    },
    include: {
      candidate: {
        include: { profile: { select: { nome: true } } }
      },
      job: { select: { id: true, title: true } }
    },
    orderBy: { appliedAt: 'desc' }
  })

  return applications.map((app: any) => ({
    applicationId: app.id,
    candidateId: app.candidateId,
    candidateName: app.candidate.profile.nome,
    jobId: app.job.id,
    jobTitle: app.job.title,
  }))
}

export async function scheduleInterview(data: {
  applicationId: string;
  candidateId: string;
  jobId: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  locationOrLink?: string;
  notes?: string;
}) {
  const { companyId } = await requireCompanyAuth()

  const interview = await (prisma as any).interview.create({
    data: {
      companyId,
      applicationId: data.applicationId,
      candidateId: data.candidateId,
      jobId: data.jobId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      locationOrLink: data.locationOrLink,
      notes: data.notes,
      status: 'SCHEDULED'
    }
  })

  return interview
}
