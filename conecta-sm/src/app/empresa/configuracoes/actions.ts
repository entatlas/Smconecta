'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  })
  if (!profile) throw new Error('Profile not found')

  return { user, profile, supabase }
}

export async function getSettings() {
  const { profile, user } = await requireAuth()

  let prefs = await prisma.notificationPreference.findUnique({
    where: { profileId: profile.id }
  })

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { profileId: profile.id }
    })
  }

  return {
    notifications: prefs,
    userEmail: user.email,
  }
}

export async function updateNotificationSettings(data: { emailEnabled: boolean, inAppEnabled: boolean }) {
  const { profile } = await requireAuth()

  await prisma.notificationPreference.update({
    where: { profileId: profile.id },
    data
  })

  return true
}

export async function sendPasswordResetEmail(origin: string) {
  try {
    const { supabase, user } = await requireAuth()

    if (!user.email) return { error: 'E-mail de usuário não encontrado' }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-senha`,
    })

    if (error) {
      if (error.status === 429) {
        return { error: 'Muitas tentativas. Aguarde uns 2 minutos antes de tentar novamente.' }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Erro interno no servidor' }
  }
}

export async function updateUserEmail(newEmail: string, origin: string) {
  try {
    const { supabase, user } = await requireAuth()

    const { error } = await supabase.auth.updateUser({ email: newEmail }, {
      emailRedirectTo: `${origin}/auth/callback`,
    })

    if (error) {
      if (error.status === 429) {
        return { error: 'Muitas tentativas. Aguarde um pouco.' }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Erro interno no servidor' }
  }
}

