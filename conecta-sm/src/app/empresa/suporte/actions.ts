'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function createSupportTicket(
  category: string,
  subject: string,
  priority: string,
  description: string,
  attachments: string[]
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    // Buscar empresa
    const company = await prisma.company.findUnique({
      where: { profileId: user.id },
      include: { profile: true }
    });

    if (!company) {
      return { success: false, error: 'Empresa não encontrada.' };
    }

    const companyName = company.companyName || company.profile.nome;
    const companyEmail = company.contactEmail || company.profile.email;

    // Gerar protocolo (ex: #2026-123456)
    const protocol = `#${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Salvar no banco
    const ticket = await prisma.supportTicket.create({
      data: {
        protocol,
        companyId: company.id,
        category,
        subject,
        priority,
        description,
        attachments,
        status: 'Aberto'
      }
    });

    // Enviar email via nodemailer
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'affcd7001@smtp-brevo.com',
          pass: brevoApiKey,
        },
      });

      const attachmentsHtml = attachments.length > 0 
        ? `<p><strong>Anexos:</strong> ${attachments.length} arquivo(s) enviado(s) via plataforma.</p>` 
        : '';

      const mailOptions = {
        from: '"Suporte SM Soluções - Empresa" <atlasupi@gmail.com>',
        to: 'atlasupi@gmail.com', // E-mail do administrador
        subject: `[Suporte SM Soluções - EMPRESA] Chamado ${protocol} - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0056b3;">Novo Chamado de Suporte (EMPRESA): ${protocol}</h2>
            <p><strong>Empresa:</strong> ${companyName}</p>
            <p><strong>E-mail:</strong> ${companyEmail}</p>
            <p><strong>Categoria:</strong> ${category}</p>
            <p><strong>Prioridade:</strong> ${priority}</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
            <p><strong>Assunto:</strong> ${subject}</p>
            <p><strong>Descrição:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee; white-space: pre-wrap;">${description}</div>
            ${attachmentsHtml}
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    return { success: true, protocol };
  } catch (error: any) {
    console.error('Erro ao criar ticket:', error);
    return { success: false, error: 'Ocorreu um erro ao abrir o chamado. Verifique os logs do servidor.' };
  }
}

export async function getSupportTickets() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: [] };

    const company = await prisma.company.findUnique({
      where: { profileId: user.id }
    });

    if (!company) return { success: false, data: [] };

    const tickets = await prisma.supportTicket.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: tickets };
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return { success: false, data: [] };
  }
}
