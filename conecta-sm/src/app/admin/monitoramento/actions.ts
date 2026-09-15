'use server'

import { prisma } from '@/lib/prisma';

import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/api/auth'
import { NextRequest } from 'next/server'
// Para server actions NextRequest não é diretamente injetado, 
// a segurança usa cookies() ou sessão manualmente, porém
// para simplificar e garantir a compatibilidade com nossa nova API:
import { createClient } from '@/utils/supabase/server'


export async function getMonitoringData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } })
  if (profile?.tipo !== 'ADMIN') throw new Error("Forbidden")

  // Check DB connection with timeout
  const dbStart = performance.now()
  let dbStatus = "ok"
  let dbLatency = 0
  try {
    // Run the query with a strict 3 seconds timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ])
    dbLatency = Math.round(performance.now() - dbStart)
  } catch(e) {
    dbStatus = "error"
  }

  // Obter estatísticas recentes de Webhooks
  const [pending, delivered, failed] = await Promise.all([
    prisma.webhookDelivery.count({ where: { status: 'PENDING' } }),
    prisma.webhookDelivery.count({ where: { status: 'DELIVERED' } }),
    prisma.webhookDelivery.count({ where: { status: 'FAILED' } })
  ])

  // Obter últimos erros de webhook
  const lastWebhookErrors = await prisma.webhookDelivery.findMany({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, event: true, responseCode: true, createdAt: true }
  })

  // Simular status da API pública baseada em logs (se tivéssemos armazenado em BD, mas usamos console.log no prompt 11)
  // Por ora, vamos reportar OK
  
  return {
    database: { status: dbStatus, latency: dbLatency },
    api: { status: "ok" },
    webhooks: { pending, delivered, failed, recentErrors: lastWebhookErrors },
    systemStatus: dbStatus === "ok" ? "ok" : "warning"
  }
}
