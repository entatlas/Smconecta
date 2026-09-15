import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const profiles = await prisma.profile.findMany({
      where: { email: 'alysontrx@gmail.com' }
    });
    
    return NextResponse.json({ success: true, currentUser: user?.id, profiles })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
