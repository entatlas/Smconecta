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

export async function getCompanyJobs(page = 1, limit = 10, search = '', status = 'ALL') {
  const { companyId } = await requireCompanyAuth()

  const where: any = { companyId }
  if (search) where.title = { contains: search, mode: 'insensitive' }
  if (status !== 'ALL') where.status = status

  const skip = (page - 1) * limit
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        modality: true,
        city: true,
        employmentType: true,
        _count: { select: { applications: true } }
      }
    }),
    prisma.job.count({ where })
  ])

  return {
    jobs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}

export async function createCompanyJob(data: any) {
  const { companyId, profile } = await requireCompanyAuth()

  // VERIFICAÇÃO DO LIMITE DE VAGAS DO PLANO
  const { canCreateJob } = await import('@/lib/payments/limits')
  const limitCheck = await canCreateJob(companyId)
  
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason || 'Limite de vagas atingido pelo seu plano atual.')
  }

  const descriptionFull = data.requirements 
    ? `${data.description}\n\n**Requisitos:**\n${data.requirements}` 
    : data.description || '';

  const job = await prisma.job.create({
    data: {
      companyId,
      title: data.title,
      area: 'Geral', // Required by schema
      description: descriptionFull,
      status: data.status,
      city: data.location || '',
      modality: data.modality || 'Presencial',
      employmentType: data.hiringType || 'CLT',
      salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
      salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
      salaryVisibility: data.salaryVisibility !== undefined ? data.salaryVisibility : true,
      experienceLevel: data.experienceLevel || null,
    }
  })

  await logAuditAction({
    profileId: profile.id,
    action: 'JOB_CREATED',
    entityType: 'JOB',
    entityId: job.id,
    newData: { status: job.status }
  })

  return job
}

export async function updateJobStatus(jobId: string, status: string) {
  const { companyId, profile } = await requireCompanyAuth()

  const job = await prisma.job.findFirst({ where: { id: jobId, companyId } })
  if (!job) throw new Error('Vaga não encontrada')

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: { status }
  })

  await logAuditAction({
    profileId: profile.id,
    action: 'JOB_STATUS_CHANGED',
    entityType: 'JOB',
    entityId: job.id,
    oldData: { status: job.status },
    newData: { status }
  })

  return updatedJob
}

export async function getCompanyJob(jobId: string) {
  const { companyId } = await requireCompanyAuth()

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId }
  })

  if (!job) throw new Error('Vaga não encontrada')

  return job
}

export async function updateCompanyJob(jobId: string, data: any) {
  const { companyId, profile } = await requireCompanyAuth()

  const job = await prisma.job.findFirst({ where: { id: jobId, companyId } })
  if (!job) throw new Error('Vaga não encontrada')

  const descriptionFull = data.requirements 
    ? `${data.description}\n\n**Requisitos:**\n${data.requirements}` 
    : data.description || '';

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: {
      title: data.title,
      description: descriptionFull,
      city: data.location || '',
      modality: data.modality || 'Presencial',
      employmentType: data.hiringType || 'CLT',
    }
  })

  await logAuditAction({
    profileId: profile.id,
    action: 'JOB_UPDATED',
    entityType: 'JOB',
    entityId: job.id,
  })

  return updatedJob
}
