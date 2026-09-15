'use server';

import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ActivityFeedItem = {
  id: string;
  type: 'NEW_CANDIDATE' | 'NEW_COMPANY' | 'NEW_JOB' | 'NEW_APPLICATION';
  title: string;
  description: string;
  date: Date;
  timeAgo: string;
};

export async function getRecentActivities(): Promise<ActivityFeedItem[]> {
  try {
    const activities: ActivityFeedItem[] = [];

    // 1. Novos Perfis (Candidatos e Empresas)
    const recentProfiles = await prisma.profile.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    for (const p of recentProfiles) {
      if (p.tipo === 'CANDIDATE') {
        activities.push({
          id: `cand-${p.id}`,
          type: 'NEW_CANDIDATE',
          title: 'Novo Candidato Registrado',
          description: `${p.nome} se juntou à plataforma.`,
          date: p.created_at,
          timeAgo: ''
        });
      } else if (p.tipo === 'COMPANY') {
        activities.push({
          id: `comp-${p.id}`,
          type: 'NEW_COMPANY',
          title: 'Nova Empresa Registrada',
          description: `${p.nome} se juntou à plataforma.`,
          date: p.created_at,
          timeAgo: ''
        });
      }
    }

    // 2. Novas Vagas
    const recentJobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    for (const job of recentJobs) {
      activities.push({
        id: `job-${job.id}`,
        type: 'NEW_JOB',
        title: 'Nova Vaga Publicada',
        description: `Uma nova vaga para ${job.title} foi criada.`,
        date: job.createdAt,
        timeAgo: ''
      });
    }

    // 3. Novas Candidaturas
    const recentApps = await prisma.application.findMany({
      orderBy: { appliedAt: 'desc' },
      take: 15,
      include: {
        candidate: { include: { profile: true } },
        job: true,
      }
    });

    for (const app of recentApps) {
      activities.push({
        id: `app-${app.id}`,
        type: 'NEW_APPLICATION',
        title: 'Nova Candidatura',
        description: `${app.candidate.profile.nome} se candidatou para a vaga de ${app.job.title}.`,
        date: app.appliedAt,
        timeAgo: ''
      });
    }

    // Ordenar todas as atividades juntas pela data (mais recente primeiro)
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Pegar apenas as 20 mais recentes de tudo
    const finalActivities = activities.slice(0, 20);

    // Formatar tempo relativo
    return finalActivities.map(act => ({
      ...act,
      timeAgo: formatDistanceToNow(act.date, { addSuffix: true, locale: ptBR })
    }));

  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    return [];
  }
}
export async function getDashboardStats() {
  try {
    const totalCandidates = await prisma.profile.count({ where: { tipo: 'CANDIDATE' } });
    const totalCompanies = await prisma.profile.count({ where: { tipo: 'COMPANY' } });
    const openJobs = await prisma.job.count({ where: { status: 'PUBLISHED' } });
    
    // For Employability Index
    const hiredCount = await prisma.application.count({ 
      where: { 
        status: { in: ['HIRED', 'APPROVED'] }
      } 
    });
    const totalApplications = await prisma.application.count();
    let employabilityIndex = 0;
    if (totalApplications > 0) {
      employabilityIndex = Math.round((hiredCount / totalApplications) * 100);
    }

    // 5. Crescimento da Plataforma (últimos 7 meses)
    const growthData = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await prisma.profile.count({
        where: {
          created_at: {
            gte: d,
            lt: nextMonth,
          }
        }
      });
      
      growthData.push({
        name: months[d.getMonth()],
        users: count
      });
    }

    // 6. Dados do Funil de Contratação
    const apps = await prisma.application.groupBy({
      by: ['status'],
      _count: true
    });

    let hired = 0;
    let inProcess = 0;
    let rejected = 0;

    apps.forEach(app => {
      const status = app.status;
      const count = app._count;
      if (['APPROVED', 'HIRED'].includes(status)) {
        hired += count;
      } else if (['REJECTED', 'WITHDRAWN', 'NO_SHOW', 'FIRED'].includes(status)) {
        rejected += count;
      } else {
        inProcess += count;
      }
    });



    const hiringData = [
      { name: 'Contratados', value: hired, color: '#10b981' },
      { name: 'Em Processo', value: inProcess, color: '#3b82f6' },
      { name: 'Rejeitados', value: rejected, color: '#ef4444' },
    ];

    // 7. Distribuição de Áreas de Interesse
    const areasCount = await prisma.candidate.groupBy({
      by: ['professionalArea'],
      _count: true,
    });

    const areaData = areasCount
      .filter(a => a.professionalArea) // remove nulls and empties if any
      .map(a => ({ name: a.professionalArea || 'Outros', count: a._count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // top 6 areas to fit nicely in a chart

    return {
      totalCandidates,
      totalCompanies,
      openJobs,
      employabilityIndex,
      growthData,
      hiringData,
      areaData
    };
  } catch (error) {
    console.error('Erro ao buscar stats do dashboard:', error);
    return { totalCandidates: 0, totalCompanies: 0, openJobs: 0, employabilityIndex: 0 };
  }
}
