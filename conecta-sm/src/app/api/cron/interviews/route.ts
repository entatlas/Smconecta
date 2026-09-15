import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dispatchEvent } from '@/lib/events/EventDispatcher';

// Força a renderização dinâmica (Vercel Cron)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verificação de segurança (Authorization)
    // Opcional para dev local, mas obrigatório em prod
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Iniciando verificação de lembretes de entrevista...');

    const now = new Date();
    const tomorrowEndOfDay = new Date(now);
    tomorrowEndOfDay.setDate(tomorrowEndOfDay.getDate() + 1);
    tomorrowEndOfDay.setHours(23, 59, 59, 999);

    const upcomingInterviews = await (prisma as any).interview.findMany({
      where: {
        status: 'SCHEDULED',
        reminderSent: false,
        date: {
          lte: tomorrowEndOfDay,
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      },
      include: {
        candidate: { include: { profile: true } },
        company: true,
        job: true
      }
    });

    let sentCount = 0;

    for (const interview of upcomingInterviews) {
      // A data no BD geralmente salva meia-noite (00:00). Juntamos com a hora.
      const [hours, minutes] = interview.time.split(':').map(Number);
      const interviewDateTime = new Date(interview.date);
      interviewDateTime.setHours(hours, minutes, 0, 0);

      // Diferença em ms
      const msUntilInterview = interviewDateTime.getTime() - now.getTime();
      
      // Se faltar entre 0 e 24h para a entrevista, enviamos.
      if (msUntilInterview > 0 && msUntilInterview <= 24 * 60 * 60 * 1000) {
        
        // Dispara o evento de lembrete
        await dispatchEvent('INTERVIEW_REMINDER', {
          candidateEmail: interview.candidate.profile.email,
          candidateName: interview.candidate.profile.nome,
          jobTitle: interview.job.title,
          companyName: interview.company.companyName,
          date: interviewDateTime.toLocaleDateString('pt-BR'),
          time: interview.time,
          locationOrLink: interview.locationOrLink || 'Local não informado'
        });

        // Atualiza a flag
        await (prisma as any).interview.update({
          where: { id: interview.id },
          data: { reminderSent: true }
        });

        sentCount++;
        console.log(`[Cron] Lembrete enviado para entrevista ID: ${interview.id}`);
      }
    }

    return NextResponse.json({ success: true, processed: upcomingInterviews.length, sentCount });
  } catch (error: any) {
    console.error('[Cron] Erro ao processar lembretes de entrevista:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
