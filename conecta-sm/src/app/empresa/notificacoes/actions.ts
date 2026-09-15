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
  
  return { profileId: profile.id }
}

export async function getCompanyNotifications() {
  const { profileId } = await requireCompanyAuth()

  const notifications = await prisma.notification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' }
  })

  return notifications
}

export async function markAsRead(notificationId: string) {
  const { profileId } = await requireCompanyAuth()

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, profileId }
  })

  if (!notification) throw new Error('Notificação não encontrada.')

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true, readAt: new Date() }
  })

  return { success: true }
}

export async function markAllAsRead() {
  const { profileId } = await requireCompanyAuth()

  await prisma.notification.updateMany({
    where: { profileId, read: false },
    data: { read: true, readAt: new Date() }
  })

  return { success: true }
}
