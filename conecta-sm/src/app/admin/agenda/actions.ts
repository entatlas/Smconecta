'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

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

export async function getAllInterviews() {
  await requireAdminAuth()
  
  // Use any to bypass Prisma type generation issues if any
  const interviews = await (prisma as any).interview.findMany({
    include: {
      job: { select: { title: true } },
      candidate: { include: { profile: { select: { nome: true } } } },
      company: { select: { companyName: true } }
    },
    orderBy: { date: 'asc' }
  })
  
  return interviews
}

export async function updateInterviewDate(id: string, date: Date, time: string) {
  await requireAdminAuth()
  return (prisma as any).interview.update({
    where: { id },
    data: { date, time }
  })
}

export async function updateInterviewStatus(id: string, status: string) {
  await requireAdminAuth()
  return (prisma as any).interview.update({
    where: { id },
    data: { status }
  })
}

// ----------------------------------------------------------------------
// GENERIC CALENDAR EVENTS (CalendarEvent)
// ----------------------------------------------------------------------

export async function getAdminCalendarEvents() {
  const { profile } = await requireAdminAuth()
  
  return prisma.calendarEvent.findMany({
    where: { ownerId: profile.id }, // Only events created by this admin
    orderBy: { startAt: 'asc' }
  })
}

export async function createAdminCalendarEvent(data: {
  title: string
  description?: string
  eventType: string
  startAt: Date
  endAt: Date
  location?: string
  modality?: string
}) {
  const { profile } = await requireAdminAuth()
  
  return prisma.calendarEvent.create({
    data: {
      ...data,
      ownerId: profile.id,
      createdById: profile.id
    }
  })
}

export async function updateAdminCalendarEvent(id: string, data: any) {
  await requireAdminAuth()
  return prisma.calendarEvent.update({
    where: { id },
    data
  })
}

export async function deleteAdminCalendarEvent(id: string) {
  await requireAdminAuth()
  return prisma.calendarEvent.delete({
    where: { id }
  })
}
