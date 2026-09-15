import { prisma } from './src/lib/prisma';

async function main() {
  console.log("Criando templates ausentes...");

  // 1. Confirmação de Conta
  await prisma.emailTemplate.upsert({
    where: { name: 'ACCOUNT_CONFIRMATION' },
    update: {},
    create: {
      name: 'ACCOUNT_CONFIRMATION',
      subject: 'Bem-vindo(a)! Confirme sua conta na SM Solutions 🚀',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #031225; padding: 30px; border-radius: 10px; border: 1px solid #00D9FF;">
  <h2 style="color: #00D9FF;">Olá, {{name}}!</h2>
  <p style="color: #EAF2FF; font-size: 16px;">Estamos muito felizes em ter você conosco.</p>
  <p style="color: #8B9BB4;">Para começar a aproveitar todas as vagas e funcionalidades, por favor, clique no botão abaixo para confirmar sua conta.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="{{confirmationLink}}" style="background-color: #00D9FF; color: #031225; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Confirmar Conta</a>
  </div>
</div>`
    }
  });

  // 2. Redefinição de Senha
  await prisma.emailTemplate.upsert({
    where: { name: 'PASSWORD_RESET' },
    update: {},
    create: {
      name: 'PASSWORD_RESET',
      subject: 'Recuperação de Senha - SM Solutions 🔒',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #031225; padding: 30px; border-radius: 10px; border: 1px solid #00D9FF;">
  <h2 style="color: #00D9FF;">Olá, {{name}}!</h2>
  <p style="color: #EAF2FF; font-size: 16px;">Recebemos uma solicitação para redefinir a sua senha.</p>
  <p style="color: #8B9BB4;">Se foi você, clique no link abaixo para criar uma nova senha. Se não foi você, apenas ignore este e-mail.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="{{resetLink}}" style="background-color: #00D9FF; color: #031225; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Redefinir Senha</a>
  </div>
</div>`
    }
  });

  console.log("Templates 'ACCOUNT_CONFIRMATION' e 'PASSWORD_RESET' criadas com sucesso!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
