'use server'

import { prisma } from '@/lib/prisma';

import { PrismaClient } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
import { logAuditAction } from '@/lib/api/audit'


// --------------------------------------------------
// Helper: get authenticated candidate
// --------------------------------------------------
async function requireCandidateAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { candidateProfile: true }
  })

  if (!profile || !profile.candidateProfile) {
    throw new Error('Perfil de candidato não encontrado')
  }

  return {
    user,
    profile,
    candidate: profile.candidateProfile,
    candidateId: profile.candidateProfile.id,
    profileId: profile.id
  }
}

export async function getCandidateProfileSummary() {
  try {
    const { candidateId } = await requireCandidateAuth()
    const fullCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        profile: { select: { nome: true, email: true, telefone: true } },
        experiences: { select: { role: true, company: true } },
        education: { select: { course: true, institution: true } }
      }
    })
    
    if (!fullCandidate) return null
    return {
      nome: fullCandidate.profile.nome,
      email: fullCandidate.profile.email,
      telefone: fullCandidate.profile.telefone,
      cargo: fullCandidate.desiredRole || fullCandidate.headline,
      cidade: fullCandidate.city,
      experiencias: fullCandidate.experiences.length,
      formacoes: fullCandidate.education.length
    }
  } catch (err) {
    return null
  }
}

// --------------------------------------------------
// Atualizar Currículo (PDF)
// --------------------------------------------------
export async function updateCandidateResumeUrl(url: string | null) {
  const { candidateId, profileId } = await requireCandidateAuth()
  
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { resumeUrl: url }
  })

  await logAuditAction({
    profileId,
    action: 'RESUME_UPDATED',
    entityType: 'CANDIDATE',
    entityId: candidateId,
    newData: { resumeUrl: url }
  })

  return { success: true }
}

// --------------------------------------------------
// Dashboard
// --------------------------------------------------
export async function getCandidateDashboard() {
  const { candidateId, profile } = await requireCandidateAuth()
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId }, select: { subscriptionStatus: true } })

  const [
    applicationsCount,
    savedJobsCount,
    interviewsCount,
    ongoingCourses,
    recentApplications
  ] = await Promise.all([
    prisma.application.count({ where: { candidateId } }),
    prisma.savedJob.count({ where: { candidateId } }),
    prisma.application.count({ where: { candidateId, status: 'INTERVIEW' } }),
    prisma.courseEnrollment.count({ where: { candidateId, status: 'IN_PROGRESS' } }),
    prisma.application.findMany({
      where: { candidateId },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: {
          select: {
            title: true,
            company: { select: { tradeName: true } }
          }
        }
      }
    })
  ])

  return {
    userName: profile.nome,
    subscriptionStatus: candidate?.subscriptionStatus,
    applicationsCount,
    savedJobsCount,
    interviewsCount,
    ongoingCourses,
    recentApplications: recentApplications.map(app => ({
      id: app.id,
      jobTitle: app.job.title,
      company: app.job.company.tradeName,
      status: app.status,
      appliedAt: app.appliedAt
    }))
  }
}

// --------------------------------------------------
// Busca de Vagas Públicas
// --------------------------------------------------
export async function getPublicJobs(opts: {
  search?: string
  modality?: string
  hiringType?: string
  page?: number
  limit?: number
}) {
  const { search = '', modality = '', hiringType = '', page = 1, limit = 15 } = opts
  const skip = (page - 1) * limit

  const where: any = { status: 'PUBLISHED' }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { area: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (modality) where.modality = { contains: modality, mode: 'insensitive' }
  if (hiringType) where.employmentType = hiringType

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { tradeName: true, city: true, state: true } },
        _count: { select: { applications: true } }
      }
    }),
    prisma.job.count({ where })
  ])

  const dbJobs = jobs.map(j => ({
      id: j.id,
      title: j.title,
      area: j.area,
      modality: j.modality,
      employmentType: j.employmentType,
      city: j.city,
      state: j.state,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryVisibility: j.salaryVisibility,
      createdAt: j.createdAt,
      company: j.company.tradeName,
      companyCity: j.company.city,
      applicationCount: j._count.applications
    }));

  return {
    jobs: dbJobs,
    pagination: { page, limit, total: total, totalPages: Math.ceil(total / limit) }
  }
}

// --------------------------------------------------
// Detalhes de Vaga
// --------------------------------------------------
export async function getJobDetails(jobId: string) {
// --------------------------------------------------

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: { tradeName: true, companyName: true, city: true, state: true, website: true }
      }
    }
  })

  if (!job) return null

  return {
    id: job.id,
    title: job.title,
    area: job.area,
    modality: job.modality,
    employmentType: job.employmentType,
    city: job.city,
    state: job.state,
    description: job.description,
    benefits: job.benefits,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryVisibility: job.salaryVisibility,
    status: job.status,
    createdAt: job.createdAt,
    company: job.company
  }
}

// --------------------------------------------------
// Verificar se já se candidatou
// --------------------------------------------------
export async function checkJobApplication(jobId: string) {
  const { candidateId } = await requireCandidateAuth()

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId } }
  })

  return existing ? { applied: true, status: existing.status, appliedAt: existing.appliedAt } : { applied: false }
}

// --------------------------------------------------
// Candidatar-se a uma vaga (com proteção IDOR + duplicata + status)
// --------------------------------------------------
export async function applyToJob(jobId: string) {
  const { candidateId, profileId } = await requireCandidateAuth()

  // Verificar se a vaga existe e está aberta, e pegar o email da empresa
  const job = await prisma.job.findUnique({ 
    where: { id: jobId },
    include: { company: { include: { profile: true } } }
  })
  if (!job) throw new Error('Vaga não encontrada.')
  if (job.status !== 'PUBLISHED') throw new Error('Esta vaga não está aceitando novas candidaturas no momento.')

  // Buscar os dados completos do candidato para o snapshot
  const fullCandidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      profile: true,
      education: true,
      experiences: true,
      skills: true,
      languages: true,
      courses: true,
      certificates: true
    }
  })

  if (!fullCandidate) throw new Error('Perfil incompleto.')

  // Montar o snapshotData
  const snapshotData = {
    profile: {
      nome: fullCandidate.profile.nome,
      email: fullCandidate.profile.email,
      telefone: fullCandidate.profile.telefone,
      avatar_url: fullCandidate.profile.avatar_url,
    },
    candidate: {
      city: fullCandidate.city,
      state: fullCandidate.state,
      desiredRole: fullCandidate.desiredRole,
      headline: fullCandidate.headline,
      about: fullCandidate.about,
    },
    experiences: fullCandidate.experiences,
    education: fullCandidate.education,
    skills: fullCandidate.skills,
    languages: fullCandidate.languages,
    courses: fullCandidate.courses,
    certificates: fullCandidate.certificates
  }

  // Verificar duplicata ou candidatura retirada
  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId } }
  })

  let application;

  if (existing) {
    if (existing.status === 'WITHDRAWN') {
      // Reativar a candidatura
      application = await prisma.application.update({
        where: { id: existing.id },
        data: {
          status: 'SENT',
          snapshotData: snapshotData as any,
          appliedAt: new Date()
        }
      });
    } else {
      throw new Error('Você já se candidatou a esta vaga.')
    }
  } else {
    // Criar candidatura do zero
    application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        status: 'SENT',
        snapshotData: snapshotData as any
      }
    });
  }

  // Registrar no histórico
  await prisma.applicationHistory.create({
    data: {
      applicationId: application.id,
      oldStatus: existing ? 'WITHDRAWN' : '',
      newStatus: 'SENT',
      changedBy: profileId
    }
  })

  // Registrar auditoria
  await logAuditAction({
    profileId,
    action: 'APPLICATION_SUBMITTED',
    entityType: 'APPLICATION',
    entityId: application.id,
    newData: { jobId, candidateId, reapplication: !!existing }
  })

  // Criar notificação no sistema para Administradores
  const admins = await prisma.profile.findMany({ where: { tipo: 'ADMIN' } })
  for (const admin of admins) {
    try {
      await prisma.notification.create({
        data: {
          profileId: admin.id,
          type: 'INFO',
          title: 'Nova candidatura recebida',
          message: `${fullCandidate.profile.nome} se candidatou à vaga de ${job.title}.`,
          link: `/admin/candidaturas/${application.id}`,
        }
      })
    } catch (e) {
      // Ignorar
    }
  }

  // Notificar a Empresa (Sistema e Email)
  if (job.company?.profileId) {
    // 1. Notificação no sistema
    try {
      await prisma.notification.create({
        data: {
          profileId: job.company.profileId,
          type: 'INFO',
          title: 'Novo Candidato!',
          message: `${fullCandidate.profile.nome} se candidatou à sua vaga de ${job.title}.`,
          link: `/empresa/candidaturas/${application.id}`,
        }
      })
    } catch (e) {}

    // 2. Notificação por Email via Brevo
    try {
      const brevoApiKey = process.env.BREVO_API_KEY;
      if (brevoApiKey && job.company.profile?.email) {
        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: 'Conecta SM', email: 'no-reply@smsolutions.com.br' },
            to: [{ email: job.company.profile.email, name: job.company.tradeName }],
            subject: 'Novo Candidato Recebido! 🎉',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #0070f3;">Olá, equipe da ${job.company.tradeName}!</h2>
                <p>O candidato <strong>${fullCandidate.profile.nome}</strong> acaba de se candidatar para a sua vaga de <strong>${job.title}</strong>.</p>
                <p>Acesse o painel do Conecta SM para analisar o currículo completo.</p>
                <br/>
                <a href="https://smsolutions-three.vercel.app/empresa/candidaturas" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Candidaturas</a>
              </div>
            `
          })
        }).catch(err => console.error('Erro ao notificar empresa via Brevo:', err));
      }

      if (brevoApiKey && fullCandidate.profile.email) {
        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: 'Conecta SM', email: 'no-reply@smsolutions.com.br' },
            to: [{ email: fullCandidate.profile.email, name: fullCandidate.profile.nome }],
            subject: 'Sua candidatura foi enviada com sucesso! ✅',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #0070f3;">Olá, ${fullCandidate.profile.nome}!</h2>
                <p>Seu currículo foi enviado com sucesso para a vaga de <strong>${job.title}</strong> na empresa <strong>${job.company.tradeName}</strong>.</p>
                <p>Cruze os dedos! Você pode acompanhar o status do processo diretamente no seu painel.</p>
                <br/>
                <a href="https://smsolutions-three.vercel.app/candidato/candidaturas" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acompanhar Status</a>
              </div>
            `
          })
        }).catch(err => console.error('Erro ao notificar candidato via Brevo:', err));
      }

    } catch (e) {}
  }

  return { success: true, applicationId: application.id }
}

export async function withdrawApplication(applicationId: string) {
  const { candidateId, profileId, profile } = await requireCandidateAuth()

  const application = await prisma.application.findUnique({
    where: { id: applicationId, candidateId },
    include: {
      job: { include: { company: true } }
    }
  })

  if (!application) throw new Error('Candidatura não encontrada.')
  if (['REJECTED', 'WITHDRAWN', 'HIRED'].includes(application.status)) {
    throw new Error('Não é possível retirar esta candidatura.')
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'WITHDRAWN' }
  })

  await prisma.applicationHistory.create({
    data: {
      applicationId: application.id,
      oldStatus: application.status,
      newStatus: 'WITHDRAWN',
      changedBy: profileId
    }
  })

  await logAuditAction({
    profileId,
    action: 'APPLICATION_WITHDRAWN',
    entityType: 'APPLICATION',
    entityId: application.id,
  })

  // Notificar a Empresa
  if (application.job.company?.profileId) {
    try {
      await prisma.notification.create({
        data: {
          profileId: application.job.company.profileId,
          type: 'WARNING',
          title: 'Desistência de Candidato',
          message: `${profile.nome} retirou a candidatura para a vaga de ${application.job.title}.`,
          link: `/empresa/candidaturas`,
        }
      })
    } catch (e) {}
  }

  return { success: true }
}


// --------------------------------------------------
// Salvar / Remover vaga dos favoritos
// --------------------------------------------------
export async function saveJob(jobId: string) {
  const { candidateId } = await requireCandidateAuth()

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return { saved: false, error: 'Vaga não encontrada no banco de dados (provavelmente é uma vaga de demonstração).' }
    
    await prisma.savedJob.create({ data: { candidateId, jobId } })
    return { saved: true }
  } catch (error) {
    return { saved: false, error: 'Erro ao salvar vaga.' }
  }
}

export async function unsaveJob(jobId: string) {
  const { candidateId } = await requireCandidateAuth()

  await prisma.savedJob.deleteMany({ where: { candidateId, jobId } })
  return { removed: true }
}

export async function isJobSaved(jobId: string) {
  const { candidateId } = await requireCandidateAuth()
  const saved = await prisma.savedJob.findUnique({
    where: { candidateId_jobId: { candidateId, jobId } }
  })
  return { saved: !!saved }
}

export async function getSavedJobIds() {
  const { candidateId } = await requireCandidateAuth()
  const saved = await prisma.savedJob.findMany({
    where: { candidateId },
    select: { jobId: true }
  })
  return saved.map(s => s.jobId)
}

// --------------------------------------------------
// Minhas Candidaturas
// --------------------------------------------------
export async function getMyCandidatures(statusFilter = 'ALL') {
  const { candidateId } = await requireCandidateAuth()

  const where: any = { candidateId }
  if (statusFilter !== 'ALL') where.status = statusFilter

  const applications = await prisma.application.findMany({
    where,
    orderBy: { appliedAt: 'desc' },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
      job: {
        select: {
          title: true,
          area: true,
          company: { select: { tradeName: true } }
        }
      },
      history: {
        select: { oldStatus: true, newStatus: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return applications.map(app => ({
    id: app.id,
    jobTitle: app.job.title,
    company: app.job.company.tradeName,
    area: app.job.area,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    history: app.history.map(h => ({
      from: h.oldStatus,
      to: h.newStatus,
      at: h.createdAt
    }))
  }))
}

// --------------------------------------------------
// Vagas Salvas
// --------------------------------------------------
export async function getSavedJobs() {
  const { candidateId } = await requireCandidateAuth()

  const saved = await prisma.savedJob.findMany({
    where: { candidateId },
    orderBy: { savedAt: 'desc' },
    select: {
      id: true,
      savedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          area: true,
          modality: true,
          city: true,
          state: true,
          status: true,
          company: { select: { tradeName: true } }
        }
      }
    }
  })

  return saved.map(s => ({
    savedId: s.id,
    jobId: s.job.id,
    title: s.job.title,
    company: s.job.company.tradeName,
    area: s.job.area,
    modality: s.job.modality,
    city: s.job.city,
    state: s.job.state,
    status: s.job.status,
    savedAt: s.savedAt
  }))
}
