'use server'

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server'

export async function getCompanyDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  })

  if (!profile || !profile.companyProfile) {
    if (profile?.tipo === 'ADMIN') {
      return {
        companyName: 'Modo Admin (Sem Empresa)',
        activeJobsCount: 0,
        totalApplications: 0,
        inProcessCount: 0,
        interviewsCount: 0,
        pipeline: { received: 0, inReview: 0, interview: 0, finalists: 0 },
        recentApplications: [],
        attentionNeeded: 0,
        upcomingInterviews: [],
        myJobsList: [],
        topJob: null
      }
    }
    throw new Error('Empresa não encontrada')
  }

  const companyId = profile.companyProfile.id
  const companyName = profile.nome || (profile.companyProfile as any).companyName || (profile.companyProfile as any).razao_social || 'Empresa'

  // Vagas Ativas
  const activeJobsCount = await prisma.job.count({
    where: { companyId, status: 'PUBLISHED' }
  })

  // Todas as vagas para a área "Minhas Vagas"
  const myJobsListRaw = await prisma.job.findMany({
    where: { companyId },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      applicationDeadline: true,
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  const myJobsList = myJobsListRaw.map(job => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : null
  }))

  const topJobs = await prisma.job.findMany({
    where: { companyId },
    select: {
      id: true,
      title: true,
      _count: { select: { applications: true } }
    },
    orderBy: { applications: { _count: 'desc' } },
    take: 1
  })
  const topJob = topJobs.length > 0 && topJobs[0]._count.applications > 0 ? topJobs[0] : null

  // Candidaturas completas para agregação e listagem
  const applications = await prisma.application.findMany({
    where: { job: { companyId } },
    select: { 
      id: true, 
      status: true, 
      appliedAt: true, 
      candidate: { select: { profile: { select: { nome: true } } } },
      job: { select: { title: true } } 
    },
    orderBy: { appliedAt: 'desc' }
  })

  const totalApplications = applications.length
  
  // Pipeline Stats
  const pipeline = {
    received: applications.filter(a => a.status === 'SENT').length,
    inReview: applications.filter(a => a.status === 'IN_REVIEW' || a.status === 'SHORTLISTED').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    finalists: applications.filter(a => a.status === 'APPROVED').length, // ou hired
  }

  const inProcessCount = pipeline.received + pipeline.inReview + pipeline.interview

  // Atividades/Candidaturas Recentes
  const recentApplications = applications.slice(0, 5).map(a => ({
    id: a.id,
    candidateName: a.candidate.profile.nome,
    jobTitle: a.job.title,
    status: a.status,
    appliedAt: a.appliedAt.toISOString()
  }))

  // Atenção Necessária
  const attentionNeeded = applications.filter(a => a.status === 'SENT').length

  // Entrevistas
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const upcomingInterviewsRaw = await prisma.interview.findMany({
    where: { 
      companyId, 
      date: { gte: today }
    },
    select: {
      id: true,
      date: true,
      time: true,
      type: true,
      candidate: { select: { profile: { select: { nome: true } } } },
      job: { select: { title: true } }
    },
    orderBy: { date: 'asc' },
    take: 5
  }).catch(() => []) // Falback em caso do modelo não estar acessível

  const upcomingInterviews = upcomingInterviewsRaw.map(i => ({
    id: i.id,
    candidateName: i.candidate.profile.nome,
    jobTitle: i.job.title,
    scheduledAt: i.date.toISOString(),
    format: i.type,
    status: 'SCHEDULED'
  }))

  const interviewsCount = upcomingInterviewsRaw.length

  return {
    companyName,
    activeJobsCount,
    totalApplications,
    inProcessCount,
    interviewsCount,
    pipeline,
    recentApplications,
    attentionNeeded,
    upcomingInterviews,
    myJobsList,
    topJob
  }
}
