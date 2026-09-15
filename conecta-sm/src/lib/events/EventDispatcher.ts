import { prisma } from '@/lib/prisma';
import { sendEmailForEvent } from './EmailService';

/**
 * Registra um evento no sistema de forma idempotente e aciona integrações.
 */
export async function dispatchEvent(
  eventType: string,
  payload: any,
  idempotencyKey?: string
) {
  // 1. Idempotency Check
  if (idempotencyKey) {
    const existing = await prisma.systemEvent.findUnique({
      where: { idempotencyKey }
    });
    if (existing) {
      console.log(`[EventDispatcher] Evento duplicado ignorado: ${eventType} (${idempotencyKey})`);
      return existing;
    }
  }

  // 2. Persist Event (Outbox Pattern)
  const systemEvent = await prisma.systemEvent.create({
    data: {
      eventType,
      payload: JSON.stringify(payload),
      idempotencyKey: idempotencyKey || undefined,
      status: 'PENDING'
    }
  });

  // 3. Process Event (Asynchronously if possible, but NextJS serverless requires waiting or triggering a background API)
  // To not block the main thread and provide "Fire and Forget", we don't await this directly, 
  // or we catch all errors so it never throws to the caller.
  processEvent(systemEvent.id).catch(err => {
    console.error(`[EventDispatcher] Falha crítica ao processar evento assíncrono ${systemEvent.id}:`, err);
  });

  return systemEvent;
}

/**
 * Processa um evento específico da tabela SystemEvent.
 */
async function processEvent(eventId: string) {
  const event = await prisma.systemEvent.findUnique({ where: { id: eventId } });
  if (!event || event.status === 'PROCESSED') return;

  const payload = JSON.parse(event.payload);

  try {
    // A. Webhooks globais
    await processWebhooks(event.eventType, payload);

    // B. Notificações Internas (In-App)
    await processInternalNotifications(event.eventType, payload);

    // C. Eventos Customizados / Orquestração
    if (event.eventType === 'JOB_CREATED') {
      // 1. Achar a vaga para saber a área profissional
      const job = await prisma.job.findUnique({ where: { id: payload.jobId }, include: { company: true }});
      if (job && job.professionalAreaId) {
        // 2. Achar candidatos com interesse na mesma área
        const candidates = await prisma.candidate.findMany({
          where: {
            professionalInterests: {
              some: { professionalAreaId: job.professionalAreaId }
            }
          },
          include: { profile: true }
        });
        
        // Se profissional_area for texto direto no Candidate (legacy)
        const candidatesLegacy = await prisma.candidate.findMany({
          where: { professionalArea: job.area },
          include: { profile: true }
        });

        // Junta tudo, remove duplicatas pelo ID
        const allCandidatesMap = new Map();
        [...candidates, ...candidatesLegacy].forEach(c => allCandidatesMap.set(c.id, c));
        
        // 3. Dispara JOB_MATCH para cada um
        for (const candidate of Array.from(allCandidatesMap.values())) {
          await sendEmailForEvent('JOB_MATCH', {
            candidateEmail: candidate.profile.email,
            candidateName: candidate.profile.nome,
            jobTitle: job.title,
            companyName: job.company.companyName
          });
        }
      }
    }

    if (event.eventType === 'APPLICATION_CREATED') {
      // Dispara para a empresa
      if (payload.companyEmail) {
        await sendEmailForEvent('COMPANY_APPLICATION_RECEIVED', {
          companyEmail: payload.companyEmail,
          candidateName: payload.candidateName,
          jobTitle: payload.jobTitle,
          applicationId: payload.applicationId
        });
      }
      
      // Dispara para o candidato
      if (payload.candidateEmail) {
        await sendEmailForEvent('CANDIDATE_APPLICATION_SENT', {
          candidateEmail: payload.candidateEmail,
          candidateName: payload.candidateName,
          jobTitle: payload.jobTitle
        });
      }
    }

    // D. Email Padrão do evento atual (Fallback)
    await sendEmailForEvent(event.eventType, payload);

    // Marca como processado
    await prisma.systemEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        attempts: { increment: 1 }
      }
    });
  } catch (error: any) {
    // Falha no processamento (Dead Letter / Retry lógico)
    await prisma.systemEvent.update({
      where: { id: eventId },
      data: {
        status: 'FAILED',
        errorLog: error.message,
        attempts: { increment: 1 }
      }
    });
  }
}

/**
 * Processa Webhooks vinculados ao evento
 */
async function processWebhooks(eventType: string, payload: any) {
  const webhooks = await prisma.webhook.findMany({
    where: { active: true, events: { has: eventType } }
  });

  for (const hook of webhooks) {
    // Cria delivery em PENDING
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: hook.id,
        event: eventType,
        payload: JSON.stringify(payload)
      }
    });

    // Tenta disparar (mockado aqui pois precisa de lib HTTP como fetch ou axios)
    try {
      // Mock de envio. Num ambiente real, faria um POST no hook.url
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulando rede
      
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'DELIVERED',
          responseCode: 200,
          deliveredAt: new Date(),
          attempts: 1
        }
      });
      
      await prisma.integrationLog.create({
        data: {
          integrationType: 'WEBHOOK',
          event: eventType,
          status: 'SUCCESS',
          target: hook.url,
          requestPayload: JSON.stringify(payload)
        }
      });
    } catch (e: any) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          responseCode: 500,
          responseBody: e.message,
          attempts: 1
        }
      });

      await prisma.integrationLog.create({
        data: {
          integrationType: 'WEBHOOK',
          event: eventType,
          status: 'FAILED',
          target: hook.url,
          requestPayload: JSON.stringify(payload)
        }
      });
    }
  }
}

/**
 * Cria Notificações Internas baseadas no Evento
 */
async function processInternalNotifications(eventType: string, payload: any) {
  // Lógica customizada por evento
  if (eventType === 'APPLICATION_CREATED') {
    // Notifica a empresa
    if (payload.companyProfileId) {
      const prefs = await prisma.notificationPreference.findUnique({ where: { profileId: payload.companyProfileId }});
      if (!prefs || prefs.inAppEnabled) {
        await prisma.notification.create({
          data: {
            profileId: payload.companyProfileId,
            title: 'Nova Candidatura',
            message: `O candidato ${payload.candidateName} se inscreveu na vaga de ${payload.jobTitle}.`,
            type: 'INFO',
            link: `/empresa/candidaturas/${payload.applicationId}`
          }
        });
      }
    }
    // Notifica o candidato
    if (payload.candidateProfileId) {
      const prefs = await prisma.notificationPreference.findUnique({ where: { profileId: payload.candidateProfileId }});
      if (!prefs || prefs.inAppEnabled) {
        await prisma.notification.create({
          data: {
            profileId: payload.candidateProfileId,
            title: 'Candidatura Enviada',
            message: `Sua candidatura para ${payload.jobTitle} foi enviada com sucesso!`,
            type: 'SUCCESS',
            link: `/portal/candidaturas`
          }
        });
      }
    }
  }
  
  if (eventType === 'INTERVIEW_CREATED') {
    if (payload.candidateProfileId) {
      await prisma.notification.create({
        data: {
          profileId: payload.candidateProfileId,
          title: 'Entrevista Agendada',
          message: `Uma entrevista foi agendada para ${payload.jobTitle}. Verifique sua agenda.`,
          type: 'INFO',
          link: `/portal/agenda`
        }
      });
    }
  }

  // Mais mapeamentos de eventos podem ser adicionados aqui
}
