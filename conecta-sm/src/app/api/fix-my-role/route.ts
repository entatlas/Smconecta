import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Usuário não autenticado.' })
    }
    
    // Atualiza forçadamente o perfil exato deste usuário para ADMIN
    await prisma.profile.update({
      where: { auth_user_id: user.id },
      data: { tipo: 'ADMIN' }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sua conta foi promovida para Administrador com sucesso! Agora vá para /redirect-dashboard' 
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
