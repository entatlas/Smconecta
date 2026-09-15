'use server';

import { prisma } from '@/lib/prisma';
import { askAI } from '@/lib/ai';
import { createClient } from '@/utils/supabase/server';

export async function generateBiInsights() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const profile = await prisma.profile.findUnique({ where: { auth_user_id: user.id } });
  if (!profile || profile.tipo !== 'ADMIN') throw new Error('Acesso negado');

  // Gather basic stats for the AI
  const totalCandidatos = await prisma.profile.count({ where: { tipo: 'CANDIDATE' } });
  const totalVagas = await prisma.job.count();
  const totalCursos = await prisma.course.count();

  const prompt = `Analise os dados abaixo e gere 3 insights estratégicos rápidos para o administrador da plataforma:
Total de Candidatos: ${totalCandidatos}
Total de Vagas ativas: ${totalVagas}
Total de Cursos: ${totalCursos}

Gere um texto curto com 3 "bullet points" apontando oportunidades (ex: se há muitos candidatos e poucas vagas, ou muitos cursos). Não use jargões difíceis.`;

  return askAI(prompt, profile.id, 'Gerar_Insights_BI');
}
