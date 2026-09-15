'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function getEmpresas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!profile || profile.tipo !== 'ADMIN') {
    return []
  }

  const empresas = await prisma.profile.findMany({
    where: { tipo: 'COMPANY' },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      status: true,
      created_at: true,
      companyProfile: {
        select: {
          id: true,
          companyName: true,
          tradeName: true,
          cnpj: true,
          _count: {
            select: {
              jobs: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return empresas
}

export async function updateCompanyStatus(profileId: string, status: 'ACTIVE' | 'PENDING' | 'BLOCKED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const adminProfile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  
  if (!adminProfile || adminProfile.tipo !== 'ADMIN') {
    throw new Error('Acesso negado')
  }

  const updatedProfile = await prisma.profile.update({
    where: { id: profileId },
    data: { status }
  })

  // TODO: Send transactional email if approved

  return updatedProfile
}

