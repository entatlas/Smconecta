'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return { candidates: [], companies: [], jobs: [] };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const q = query.toLowerCase();

  const [candidates, companies, jobs] = await Promise.all([
    prisma.profile.findMany({
      where: {
        tipo: 'CANDIDATE',
        OR: [
          { nome: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: {
        id: true,
        nome: true,
        email: true,
        candidateProfile: {
          select: { id: true, headline: true }
        }
      }
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { tradeName: { contains: q, mode: 'insensitive' } },
          { cnpj: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: {
        id: true,
        companyName: true,
        tradeName: true,
        industry: true
      }
    }),
    prisma.job.findMany({
      where: {
        title: { contains: q, mode: 'insensitive' }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        company: {
          select: { companyName: true }
        }
      }
    })
  ]);

  return { 
    candidates: candidates.map(c => ({ id: c.id, nome: c.nome, email: c.email, candidate: c.candidateProfile })), 
    companies, 
    jobs 
  };
}
