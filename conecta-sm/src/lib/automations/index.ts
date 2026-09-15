import { prisma } from '@/lib/prisma';

/**
 * Automations Core
 * Aqui centralizamos os gatilhos internos (eventos disparados pelas Server Actions).
 * Em um cenário robusto, isso poderia jogar eventos num EventBus ou Queue.
 */

// 1. Gatilho de Nova Candidatura
export async function triggerNewApplication(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { include: { company: { include: { profile: true } } } }, candidate: { include: { profile: true } } }
  });

  if (!application) return;

  // Em um sistema real com tabela de Notificações, inseriríamos um registro para a empresa
  console.log(`[AUTOMAÇÃO] Nova candidatura recebida para a vaga ${application.job.title}. 
Notificando empresa ${application.job.company.companyName}...`);

  // Log opcional de automação se desejar (ou usar webhooks)
}

// 2. Gatilho de Entrevista Agendada
export async function triggerInterviewScheduled(eventId: string) {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: { participants: { include: { user: true } } }
  });

  if (!event) return;

  console.log(`[AUTOMAÇÃO] Entrevista agendada: ${event.title}. 
Notificando ${event.participants.length} participantes...`);
}

// 3. Gatilho de Curso Concluído -> Atualiza Perfil Profissional
export async function triggerCourseCompleted(enrollmentId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, candidate: true }
  });

  if (!enrollment) return;

  // Atualiza histórico do candidato
  await prisma.professionalHistory.create({
    data: {
      candidateId: enrollment.candidateId,
      eventType: 'COURSE_COMPLETED',
      title: `Concluiu o curso: ${enrollment.course.title}`,
      relatedCourseId: enrollment.courseId
    }
  });

  console.log(`[AUTOMAÇÃO] Curso concluído por ${enrollment.candidate.id}. Histórico atualizado.`);
}
