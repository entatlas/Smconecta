'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function deleteUserAccount() {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Usuário não autenticado.' }
  }

  try {
    // 1. Deletar do Prisma (cascata irá deletar Candidatos, Empresas, etc.)
    await prisma.profile.delete({
      where: { auth_user_id: user.id }
    }).catch(err => {
      console.error('Erro ao deletar profile no prisma (pode ja estar deletado):', err)
    })

    // 2. Deletar do Supabase Auth direto pelo banco de dados (ignorando a necessidade da chave de admin)
    await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = '${user.id}'::uuid;`)

    return { success: true }
  } catch (err: any) {
    console.error('Erro ao excluir conta:', err)
    return { error: err.message || 'Ocorreu um erro ao excluir a conta.' }
  }
}
