'use server'

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server'
import { logAuditAction } from '@/lib/api/audit'

async function requireCompanyAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  })

  if (!profile || !profile.companyProfile) throw new Error('Forbidden')
  
  return { user, profile, companyId: profile.companyProfile.id, company: profile.companyProfile }
}

export async function getCompanyProfile() {
  const { company } = await requireCompanyAuth()
  return company
}

export async function updateCompanyProfile(data: any) {
  const { companyId, profile } = await requireCompanyAuth()

  // Validar formato básico de CNPJ
  const cleanCnpj = data.cnpj?.replace(/\D/g, '') || ''
  if (cleanCnpj.length !== 14) {
    throw new Error('O CNPJ deve conter exatamente 14 dígitos válidos.')
  }

  // Proteger campos administrativos (Mass assignment protection)
  const safeData = {
    tradeName: data.tradeName,
    companyName: data.companyName,
    cnpj: data.cnpj,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    website: data.website,
    zipCode: data.zipCode,
    street: data.street,
    number: data.number,
    complement: data.complement,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    
    // Novos campos
    logoUrl: data.logoUrl,
    coverUrl: data.coverUrl,
    industry: data.industry,
    subIndustry: data.subIndustry,
    companySize: data.companySize,
    employeeCount: data.employeeCount,
    foundationYear: data.foundationYear ? parseInt(data.foundationYear) : null,
    
    description: data.description,
    mission: data.mission,
    vision: data.vision,
    values: data.values,
    culture: data.culture,
    workModel: data.workModel,
    benefits: data.benefits,
    
    linkedin: data.linkedin,
    instagram: data.instagram,
    facebook: data.facebook,
    hrContact: data.hrContact,
    hiringProcess: data.hiringProcess,
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: safeData
  })

  await logAuditAction({
    profileId: profile.id,
    action: 'COMPANY_PROFILE_UPDATED',
    entityType: 'COMPANY',
    entityId: companyId,
    newData: safeData
  })

  return updated
}

export async function getCompanyPublicProfile(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId, status: 'ACTIVE' },
    select: {
      id: true,
      tradeName: true,
      industry: true,
      companySize: true,
      city: true,
      state: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      mission: true,
      vision: true,
      values: true,
      culture: true,
      workModel: true,
      benefits: true,
      linkedin: true,
      instagram: true,
      facebook: true,
      website: true,
      hiringProcess: true,
      isVerified: true,
      // Buscar apenas vagas abertas
      jobs: {
        where: { status: 'OPEN' },
        select: {
          id: true,
          title: true,
          city: true,
          state: true,
          modality: true,
          createdAt: true
        }
      }
    }
  })

  return company
}
