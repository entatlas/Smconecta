import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.profile.updateMany({
      data: { tipo: 'ADMIN' }
    });
    return NextResponse.json({ success: true, message: 'Todos os usuários agora são ADMIN.' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
