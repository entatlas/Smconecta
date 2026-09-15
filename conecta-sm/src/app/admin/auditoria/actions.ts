'use server'

import { prisma } from '@/lib/prisma';

import { PrismaClient } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'


export async function getAuditLogs(page = 1, limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } })
  if (profile?.tipo !== 'ADMIN') throw new Error("Forbidden")

  const skip = (page - 1) * limit
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: { select: { nome: true, email: true } }
      }
    }),
    prisma.auditLog.count()
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
