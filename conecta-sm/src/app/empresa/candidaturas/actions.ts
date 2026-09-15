'use server'

import { prisma } from '@/lib/prisma'
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

export async function getCompanyApplications(page = 1, limit = 10, search = '', status = 'ALL') {
  const { companyId } = await requireCompanyAuth()

  // Buscar todas as vagas desta empresa primeiro para filtrar
  const jobs = await prisma.job.findMany({
    where: { companyId },
    select: { id: true }
  })
  
  const jobIds = jobs.map(j => j.id)

  const where: any = { jobId: { in: jobIds } }
  
  if (status !== 'ALL') {
    where.status = status
  }
  
  if (search) {
    where.candidate = {
      profile: {
        nome: { contains: search, mode: 'insensitive' }
      }
    }
  }

  const skip = (page - 1) * limit
  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: { select: { title: true } },
        candidate: {
          select: {
            id: true,
            profile: { select: { nome: true, email: true, avatar_url: true } }
          }
        }
      }
    }),
    prisma.application.count({ where })
  ])

  return {
    applications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}
