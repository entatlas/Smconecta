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

export async function fetchReportData(type: string, filters: any = {}) {
  await checkAdmin();
  
  if (type === 'users') {
    const data = await prisma.profile.findMany({
      select: { id: true, nome: true, email: true, tipo: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });
    
    const translateTipo = (t: string) => {
      if (t === 'CANDIDATE') return 'Candidato';
      if (t === 'COMPANY') return 'Empresa';
      if (t === 'ADMIN') return 'Administrador';
      if (t === 'PARTNER') return 'Parceiro';
      return t;
    }

    return data.map(d => ({
      'ID': d.id,
      'Nome': d.nome,
      'E-mail': d.email,
      'Tipo de Acesso': translateTipo(d.tipo),
      'Data de Criação': d.created_at
    }));
  }
  
  if (type === 'jobs') {
    const data = await prisma.job.findMany({
      select: { id: true, title: true, status: true, createdAt: true, company: { select: { companyName: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const translateJobStatus = (s: string) => {
      if (s === 'PUBLISHED') return 'Publicado';
      if (s === 'DRAFT') return 'Rascunho';
      if (s === 'CLOSED') return 'Encerrado';
      if (s === 'CANCELED') return 'Cancelado';
      return s;
    }

    return data.map(d => ({
      'ID': d.id,
      'Título': d.title,
      'Empresa': d.company?.companyName || 'N/A',
      'Status': translateJobStatus(d.status),
      'Candidaturas': d._count?.applications || 0,
      'Data de Criação': d.createdAt
    }));
  }

  if (type === 'applications') {
    const data = await prisma.application.findMany({
      select: { id: true, status: true, appliedAt: true, job: { select: { title: true } }, candidate: { select: { profile: { select: { nome: true } } } } },
      orderBy: { appliedAt: 'desc' }
    });
    
    const translateAppStatus = (s: string) => {
      if (s === 'PENDING') return 'Pendente';
      if (s === 'APPROVED' || s === 'REVIEWING') return 'Aprovado / Em Revisão';
      if (s === 'REJECTED') return 'Rejeitado';
      if (s === 'HIRED') return 'Contratado';
      if (s === 'INTERVIEWING') return 'Em Entrevista';
      if (s === 'APPROVED') return 'Aprovado';
      if (s === 'NO_SHOW') return 'Faltou na Entrevista';
      if (s === 'FIRED') return 'Demitido';
      return s;
    }

    return data.map(d => ({
      'ID': d.id,
      'Candidato': d.candidate?.profile?.nome || 'N/A',
      'Vaga': d.job?.title || 'N/A',
      'Status': translateAppStatus(d.status),
      'Data de Candidatura': d.appliedAt
    }));
  }

  return [];
}

export async function logExport(reportType: string, format: string) {
  const profile = await checkAdmin();
  
  await prisma.auditLog.create({
    data: {
      action: 'EXPORT_REPORT',
      entityType: 'BI_REPORT',
      profileId: profile.id,
      metadata: `Exported ${reportType} report as ${format}`
    }
  });

  return { success: true };
}
