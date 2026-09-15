'use server'

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function getApplications(opts: {
  search?: string
  status?: string
  jobId?: string
  page?: number
  limit?: number
}) {
  const { search = '', status = '', jobId = '', page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (status) where.status = status;
  if (jobId) where.jobId = jobId;

  if (search) {
    where.OR = [
      { candidate: { profile: { nome: { contains: search, mode: 'insensitive' } } } },
      { candidate: { profile: { email: { contains: search, mode: 'insensitive' } } } },
      { job: { title: { contains: search, mode: 'insensitive' } } }
    ]
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        candidateId: true,
        status: true,
        appliedAt: true,
        candidate: {
          select: {
            city: true,
            state: true,
            profile: {
              select: { nome: true, email: true, avatar_url: true }
            }
          }
        },
        job: {
          select: { id: true, title: true, company: { select: { tradeName: true } } }
        }
      }
    }),
    prisma.application.count({ where })
  ]);

  return {
    applications: applications.map(app => ({
      id: app.id,
      candidateId: app.candidateId,
      candidateName: app.candidate.profile.nome,
      candidateEmail: app.candidate.profile.email,
      candidateAvatar: app.candidate.profile.avatar_url,
      city: app.candidate.city || 'Não informada',
      state: app.candidate.state || '',
      jobTitle: app.job.title,
      companyName: app.job.company.tradeName,
      status: app.status,
      appliedAt: app.appliedAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getApplicationDetails(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: {
        include: { profile: true }
      },
      job: {
        include: { company: true }
      },
      history: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  return application;
}

export async function changeApplicationStatus(applicationId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });

  const oldApp = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!oldApp) throw new Error('Application not found');

  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  });

  await prisma.applicationHistory.create({
    data: {
      applicationId,
      oldStatus: oldApp.status,
      newStatus,
      changedBy: profile?.id
    }
  });

  return updatedApp;
}

export async function addInternalNote(applicationId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error('Application not found');

  const currentNotes = Array.isArray(application.internalNotes) ? (application.internalNotes as any[]) : [];
  
  const newNote = {
    text,
    date: new Date().toISOString(),
    authorId: profile?.id,
    authorName: profile?.nome || 'Administrador'
  };

  const updatedNotes = [...currentNotes, newNote];

  await prisma.application.update({
    where: { id: applicationId },
    data: { internalNotes: updatedNotes as any }
  });

  return newNote;
}

