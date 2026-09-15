'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function getCandidates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!profile || profile.tipo !== 'ADMIN') {
    // If not admin, return empty or throw
    return []
  }

  const candidates = await prisma.profile.findMany({
    where: { tipo: 'CANDIDATE' },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      created_at: true,
      status: true,
      candidateProfile: {
        select: {
          id: true,
          about: true,
          headline: true,
          desiredRole: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return candidates
}
