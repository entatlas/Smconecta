import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      where: { tipo: 'ADMIN' },
      select: { email: true, nome: true }
    });
    return NextResponse.json({ success: true, profiles })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
