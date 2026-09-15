'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  if (!profile || profile.tipo !== 'ADMIN') throw new Error('Forbidden')
  
  return { user, profile }
}

export async function getSubscriptionPlans() {
  await requireAdminAuth()
  
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' }
  })
  
  return plans.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    interval: p.interval,
    isActive: p.isActive,
    features: p.features ? JSON.parse(p.features) : { maxJobs: 1 }
  }))
}

export async function upsertSubscriptionPlan(data: any) {
  await requireAdminAuth()

  const featuresJson = JSON.stringify({
    maxJobs: parseInt(data.maxJobs) || 1,
    canViewTalents: data.canViewTalents === true || data.canViewTalents === 'true'
  })

  let plan;
  if (data.id) {
    plan = await prisma.subscriptionPlan.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval || 'MONTHLY',
        isActive: data.isActive,
        features: featuresJson
      }
    })
  } else {
    plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval || 'MONTHLY',
        isActive: data.isActive !== false,
        features: featuresJson
      }
    })
  }

  revalidatePath('/admin/assinaturas/planos')
  return plan
}

export async function deleteSubscriptionPlan(id: string) {
  await requireAdminAuth()
  await prisma.subscriptionPlan.delete({ where: { id } })
  revalidatePath('/admin/assinaturas/planos')
  return { success: true }
}
