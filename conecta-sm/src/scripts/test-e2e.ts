import { config } from 'dotenv'
config()
import { prisma } from '../lib/prisma'

async function main() {
  console.log('--- E2E MVP FLOW TEST ---')

  // 1. Create Company
  console.log('1. Creating Test Company...')
  const companyProfile = await prisma.profile.upsert({
    where: { auth_user_id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      auth_user_id: '11111111-1111-1111-1111-111111111111',
      nome: 'Test Company User',
      email: 'company@test.com',
      tipo: 'COMPANY'
    }
  })

  const company = await prisma.company.upsert({
    where: { cnpj: '11.111.111/1111-11' },
    update: {},
    create: {
      profileId: companyProfile.id,
      cnpj: '11.111.111/1111-11',
      tradeName: 'Test Company',
      companyName: 'Test Company LTDA'
    }
  })

  // 2. Create Job
  console.log('2. Creating Test Job...')
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: 'Vaga de Teste MVP',
      area: 'Tecnologia',
      description: 'Esta é uma vaga de teste',
      modality: 'Remoto',
      employmentType: 'CLT',
      status: 'PUBLISHED'
    }
  })

  // 3. Create Candidate
  console.log('3. Creating Test Candidate...')
  const candidateProfile = await prisma.profile.upsert({
    where: { auth_user_id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      auth_user_id: '22222222-2222-2222-2222-222222222222',
      nome: 'Test Candidate',
      email: 'candidate@test.com',
      tipo: 'CANDIDATE'
    }
  })

  const candidate = await prisma.candidate.upsert({
    where: { profileId: candidateProfile.id },
    update: {},
    create: {
      profileId: candidateProfile.id,
      cpf: '222.222.222-22'
    }
  })

  // 4. Candidate Applies for Job
  console.log('4. Applying for Job...')
  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidate.id,
      status: 'SENT'
    }
  })

  // 5. Query as Company
  console.log('5. Querying Applications as Company...')
  const companyApps = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    include: { candidate: { include: { profile: true } } }
  })
  
  if (companyApps.length > 0 && companyApps[0].candidate.profile.nome === 'Test Candidate') {
    console.log('✅ Flow Successful! Company can see Candidate Application.')
  } else {
    console.log('❌ Flow Failed.')
  }

  // Clean up
  console.log('6. Cleaning up...')
  await prisma.application.delete({ where: { id: application.id } })
  await prisma.job.delete({ where: { id: job.id } })
  await prisma.candidate.delete({ where: { profileId: candidateProfile.id } })
  await prisma.profile.delete({ where: { id: candidateProfile.id } })
  await prisma.company.delete({ where: { cnpj: '11.111.111/1111-11' } })
  await prisma.profile.delete({ where: { id: companyProfile.id } })

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
