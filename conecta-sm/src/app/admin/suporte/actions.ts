'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/utils/supabase/server';

export async function sendSupportEmail(subject: string, message: string, attachments: any[] = []) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const userEmail = user.email || 'Desconhecido';
    const userName = user.user_metadata?.nome || user.user_metadata?.full_name || 'Usuário';

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY não configurada.');
      return { success: false, error: 'Configuração de e-mail ausente no servidor.' };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'affcd7001@smtp-brevo.com',
        pass: brevoApiKey,
      },
    });

    const mailOptions: any = {
      from: '"Suporte SM Soluções - Admin" <atlasupi@gmail.com>',
      to: 'atlasupi@gmail.com', // E-mail da Atlas
      subject: `[Suporte SM Soluções - ADMIN] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0056b3;">Nova Mensagem de Suporte (ADMIN)</h2>
          <p><strong>Remetente (Admin):</strong> ${userName} (${userEmail})</p>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee; white-space: pre-wrap;">${message}</div>
        </div>
      `
    };

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map(att => ({
        filename: att.name,
        content: att.base64,
        encoding: 'base64'
      }));
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de suporte:', error);
    return { success: false, error: 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.' };
  }
}
