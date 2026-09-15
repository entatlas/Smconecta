'use server'

import { prisma } from '@/lib/prisma'

export async function forceConfirmEmail(userId: string) {
  try {
    await prisma.$executeRawUnsafe(`UPDATE auth.users SET email_confirmed_at = now() WHERE id = '${userId}'::uuid;`);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao confirmar email:', error);
    return { success: false, error: error.message };
  }
}

export async function checkPhoneExists(telefone: string) {
  try {
    if (!telefone) return false;
    // Removemos caracteres não numéricos para garantir uma busca precisa caso o formato varie um pouco
    const plainPhone = telefone.replace(/\D/g, '');
    
    // Busca um perfil onde o telefone corresponda ao valor (podemos buscar tanto o formatado quanto o sem formato)
    const existingProfile = await prisma.profile.findFirst({
      where: {
        OR: [
          { telefone: telefone },
          { telefone: { contains: plainPhone } }
        ]
      }
    });

    return !!existingProfile;
  } catch (error) {
    console.error('Erro ao verificar telefone:', error);
    return false; // Em caso de erro, permite continuar, mas o ideal seria logar
  }
}

export async function sendWelcomeEmail(email: string, nome: string, tipo: string) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    
    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY não configurada. O email de boas-vindas não será enviado.');
      return { success: false, error: 'Chave do Brevo não configurada' };
    }

    const isCompany = tipo === 'COMPANY';
    const subject = isCompany 
      ? 'Bem-vindo ao Conecta SM! 🏢' 
      : 'Bem-vindo ao Conecta SM! 🚀';
      
    const htmlContent = isCompany
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0070f3;">Olá, ${nome}!</h2>
          <p>Obrigado por cadastrar sua empresa no <strong>Conecta SM</strong>.</p>
          <p>Estamos muito felizes em tê-lo conosco! A partir de agora, você pode publicar vagas e encontrar os melhores talentos da nossa comunidade.</p>
          <br/>
          <p>Acesse seu painel agora mesmo para completar o perfil da sua empresa e começar.</p>
          <a href="https://smsolutions-three.vercel.app/login" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Dashboard</a>
          <br/><br/>
          <p>Um abraço,<br/><strong>Equipe SM Solutions</strong></p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0070f3;">Olá, ${nome}!</h2>
          <p>Bem-vindo(a) ao <strong>Conecta SM</strong>! 🚀</p>
          <p>É ótimo ter você aqui. Nossa plataforma foi feita para conectar grandes talentos como você às melhores oportunidades do mercado.</p>
          <br/>
          <p>O seu próximo passo é acessar a plataforma, completar o seu currículo e explorar as vagas disponíveis.</p>
          <a href="https://smsolutions-three.vercel.app/login" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Plataforma</a>
          <br/><br/>
          <p>Um abraço,<br/><strong>Equipe SM Solutions</strong></p>
        </div>
      `;

    // Import dinâmico do nodemailer para ser executado apenas no servidor
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'affcd7001@smtp-brevo.com',
        pass: brevoApiKey, 
      },
    });

    await transporter.sendMail({
      from: '"Conecta SM" <atlasupi@gmail.com>', // Usando o email que sabidamente funciona na sua conta Brevo
      to: email,
      subject: subject,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro na função sendWelcomeEmail:', error);
    return { success: false, error: error.message };
  }
}
