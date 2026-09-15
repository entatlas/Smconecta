import { prisma } from '@/lib/prisma'

export interface PlanFeatures {
  maxJobs: number
  canViewTalents: boolean
  highlightedJobs: number
}

const DEFAULT_FREE_FEATURES: PlanFeatures = {
  maxJobs: 1, // Empresa grátis pode ter 1 vaga ativa
  canViewTalents: false,
  highlightedJobs: 0
}

export async function getCompanyLimits(companyId: string): Promise<PlanFeatures> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      subscription: {
        include: { plan: true }
      }
    }
  })

  if (!company) {
    return DEFAULT_FREE_FEATURES
  }

  // Se não tem assinatura ativa, aplica limites do plano grátis
  if (company.subscriptionStatus !== 'ACTIVE' || !company.subscription) {
    // Buscar se há algum plano "Free" cadastrado no banco como fallback
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { price: 0, isActive: true }
    })
    
    if (freePlan && freePlan.features) {
      try {
        return { ...DEFAULT_FREE_FEATURES, ...JSON.parse(freePlan.features) }
      } catch (e) {
        return DEFAULT_FREE_FEATURES
      }
    }
    return DEFAULT_FREE_FEATURES
  }

  // Tem assinatura ativa
  const plan = company.subscription.plan
  if (!plan.features) return DEFAULT_FREE_FEATURES

  try {
    const parsedFeatures = JSON.parse(plan.features) as Partial<PlanFeatures>
    return {
      ...DEFAULT_FREE_FEATURES,
      ...parsedFeatures
    }
  } catch (e) {
    console.error('Error parsing plan features JSON', e)
    return DEFAULT_FREE_FEATURES
  }
}

export async function canCreateJob(companyId: string): Promise<{ allowed: boolean, reason?: string, currentActive: number, limit: number }> {
  const limits = await getCompanyLimits(companyId)
  
  // Contar vagas ativas da empresa (PUBLISHED ou DRAFT)
  // Vagas CLOSED ou PAUSED podem não contar no limite, mas para simplificar, vamos contar tudo que não for CLOSED
  const activeJobsCount = await prisma.job.count({
    where: {
      companyId,
      status: { not: 'CLOSED' }
    }
  })

  // 999 significa ilimitado para nós
  if (limits.maxJobs >= 999) {
    return { allowed: true, currentActive: activeJobsCount, limit: limits.maxJobs }
  }

  if (activeJobsCount >= limits.maxJobs) {
    return { 
      allowed: false, 
      reason: `Você atingiu o limite de ${limits.maxJobs} vagas do seu plano atual. Atualize para o Premium para postar mais vagas.`,
      currentActive: activeJobsCount,
      limit: limits.maxJobs
    }
  }

  return { allowed: true, currentActive: activeJobsCount, limit: limits.maxJobs }
}
