import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // alysontrx@gmail.com será ADMIN
    await prisma.profile.updateMany({
      where: { email: 'alysontrx@gmail.com' },
      data: { tipo: 'ADMIN' }
    });
    
    // alysonanti1@gmail.com será CANDIDATE
    await prisma.profile.updateMany({
      where: { email: 'alysonanti1@gmail.com' },
      data: { tipo: 'CANDIDATE' }
    });

    return NextResponse.json({ success: true, message: 'Permissões divididas com sucesso!' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
