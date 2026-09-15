'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') throw new Error('Acesso negado');
  return profile;
}

export async function getBIData() {
  await checkAdmin();

  const [
    totalUsers,
    totalCandidates,
    totalCompanies,
    totalPartners,
    totalJobs,
    totalApplications,
    totalCourses,
    totalCertificates
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { tipo: 'CANDIDATE' } }),
    prisma.profile.count({ where: { tipo: 'COMPANY' } }),
    prisma.partner.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.course.count(),
    prisma.certificate.count()
  ]);

  // Evolução Diária (Usuários) - Gráfico de subida
  const profiles = await prisma.profile.findMany({
    select: { created_at: true },
    orderBy: { created_at: 'asc' }
  });
  
  const dailyUsers: Record<string, number> = {};
  profiles.forEach(p => {
    // Formata a data para Dia e Mês, ex: 15 Ago
    const day = p.created_at.toLocaleString('pt-BR', { day: '2-digit', month: 'short' });
    dailyUsers[day] = (dailyUsers[day] || 0) + 1;
  });

  let cumulativeCount = 0;
  const evolutionData = Object.entries(dailyUsers).map(([day, count]) => {
    cumulativeCount += count;
    return {
      month: day, // Mantemos a chave 'month' para o gráfico no frontend continuar funcionando
      users: cumulativeCount
    };
  });

  // Áreas mais procuradas pelos candidatos (via tabela de interesses profissionais)
  const interests = await prisma.candidateProfessionalInterest.findMany({
    include: { professionalArea: { select: { name: true } } }
  });

  const areaCounts: Record<string, number> = {};
  interests.forEach(i => {
    const areaName = i.professionalArea.name;
    areaCounts[areaName] = (areaCounts[areaName] || 0) + 1;
  });

  const topAreas = Object.entries(areaCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Funil de candidaturas
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const funnelMap: Record<string, number> = {};
  applicationsByStatus.forEach(item => {
    funnelMap[item.status] = item._count.status;
  });

  const funnelData = [
    { name: 'Enviadas (SENT)', value: funnelMap['SENT'] || 0 },
    { name: 'Em Análise (IN_REVIEW)', value: funnelMap['IN_REVIEW'] || 0 },
    { name: 'Entrevista (INTERVIEW)', value: funnelMap['INTERVIEW'] || 0 },
    { name: 'Aprovados (APPROVED)', value: funnelMap['APPROVED'] || 0 }
  ];

  return {
    kpis: {
      totalUsers,
      totalCandidates,
      totalCompanies,
      totalInstructors: 0,
      totalPartners,
      totalJobs,
      totalApplications,
      totalCourses,
      totalCertificates
    },
    evolutionData,
    topAreas,
    funnelData
  };
}
