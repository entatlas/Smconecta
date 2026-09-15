import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Cria o transportador do Nodemailer usando as credenciais da Brevo (antiga Sendinblue)
// Documentação da Brevo SMTP: smtp-relay.brevo.com, port 587
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'affcd7001@smtp-brevo.com', // E-mail/Login da conta SMTP Brevo
      pass: process.env.BREVO_API_KEY, 
    },
  });
};

/**
 * Serviço de Email Transacional.
 * Interceptado pela Central de Integrações.
 */
export async function sendEmailForEvent(eventType: string, payload: any) {
  // 1. Busca configurações de EMAIL do painel de integrações
  const integration = await prisma.integration.findUnique({
    where: { type: 'EMAIL' }
  });

  // Se a integração global de email estiver desativada (opcional), não envia
  if (integration && integration.status !== 'ACTIVE') {
    console.log(`[EmailService] Integração EMAIL desativada. Ignorando ${eventType}.`);
    return;
  }

  // 2. Busca o template do evento no banco de dados
  let template = await prisma.emailTemplate.findUnique({
    where: { name: eventType }
  });

  if (!template) {
    if (eventType === 'INTERVIEW_SCHEDULED') {
      template = {
        id: 'fallback',
        name: 'INTERVIEW_SCHEDULED',
        subject: 'Entrevista Marcada - {{companyName}} 🗓️',
        body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #031225; padding: 30px; border-radius: 10px; border: 1px solid #00D9FF;">
  <h2 style="color: #00D9FF;">Olá, {{candidateName}}!</h2>
  <p style="color: #EAF2FF; font-size: 16px;">Temos ótimas notícias! A empresa <strong>{{companyName}}</strong> agendou uma entrevista com você para a vaga de <strong>{{jobTitle}}</strong>.</p>
  <div style="background-color: #061A32; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📅 Data:</strong> {{date}}</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>⏰ Horário:</strong> {{time}}</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📍 Local / Link:</strong> {{locationOrLink}}</p>
  </div>
  <p style="color: #8B9BB4;">Fique atento(a) ao horário e boa sorte na sua entrevista!</p>
</div>`
      } as any;
    } else if (eventType === 'INTERVIEW_REMINDER') {
      template = {
        id: 'fallback',
        name: 'INTERVIEW_REMINDER',
        subject: 'Lembrete de Entrevista - {{companyName}} ⏰',
        body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #031225; padding: 30px; border-radius: 10px; border: 1px solid #F59E0B;">
  <h2 style="color: #F59E0B;">Olá, {{candidateName}}!</h2>
  <p style="color: #EAF2FF; font-size: 16px;">Este é um lembrete automático. Sua entrevista com a empresa <strong>{{companyName}}</strong> para a vaga de <strong>{{jobTitle}}</strong> está se aproximando!</p>
  <div style="background-color: #061A32; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📅 Data:</strong> {{date}}</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>⏰ Horário:</strong> {{time}}</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📍 Local / Link:</strong> {{locationOrLink}}</p>
  </div>
  <p style="color: #8B9BB4;">Não se atrase, prepare-se bem e boa sorte!</p>
</div>`
      } as any;
    } else {
      console.log(`[EmailService] Nenhum template encontrado para o evento ${eventType}. Ignorando envio.`);
      return;
    }
  }

  try {
    if (!template) return;
    // 3. Processa as variáveis no Assunto e no Corpo
    let subject = template.subject;
    let bodyHtml = template.body;

    // Substituição simples de variáveis, ex: {{candidateName}}
    const keys = Object.keys(payload);
    for (const key of keys) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, payload[key] || '');
      bodyHtml = bodyHtml.replace(regex, payload[key] || '');
    }

    // 4. Determina os destinatários baseado no evento
    let toEmail = '';
    if (payload.candidateEmail) toEmail = payload.candidateEmail;
    else if (payload.companyEmail) toEmail = payload.companyEmail;
    else if (payload.toEmail) toEmail = payload.toEmail;

    if (!toEmail) {
      console.log(`[EmailService] Nenhum e-mail de destinatário encontrado no payload para o evento ${eventType}.`);
      return;
    }

    // 5. Envia o E-mail usando Brevo + Nodemailer
    const transporter = createTransporter();

    // The auth user might be atlasupi@gmail.com or an internal Brevo ID. 
    // Usually, with Brevo, the 'user' is your login email and 'pass' is the SMTP key.
    // If the Brevo API Key provided is a v3 API key, it might also work as an SMTP master password.

    const info = await transporter.sendMail({
      from: '"SM Solutions" <atlasupi@gmail.com>', // Remetente oficial
      to: toEmail,
      subject: subject,
      html: bodyHtml,
    });

    console.log(`[EmailService] E-mail enviado com sucesso para ${toEmail}. MessageId: ${info.messageId}`);

    // Salva no log
    await prisma.integrationLog.create({
      data: {
        integrationType: 'EMAIL',
        event: eventType,
        status: 'SUCCESS',
        target: toEmail,
        requestPayload: JSON.stringify({ subject, bodyHtml })
      }
    });

  } catch (error: any) {
    console.error(`[EmailService] Erro ao enviar e-mail:`, error);
    
    // Log de Erro
    await prisma.integrationLog.create({
      data: {
        integrationType: 'EMAIL',
        event: eventType,
        status: 'ERROR',
        target: payload.candidateEmail || payload.companyEmail || 'unknown',
        requestPayload: JSON.stringify({ error: error.message })
      }
    });
  }
}
