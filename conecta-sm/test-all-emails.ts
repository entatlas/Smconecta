import { sendEmailForEvent } from './src/lib/events/EmailService';
import { prisma } from './src/lib/prisma';

async function testAllEmails() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error("Por favor, forneça um email de destino como argumento.");
    console.error("Uso: npx tsx --env-file=.env test-all-emails.ts <seu-email@exemplo.com>");
    process.exit(1);
  }

  console.log(`Iniciando testes de email para: ${targetEmail}\n`);

  try {
    // 1. Confirmação de Conta
    console.log("-> Testando Confirmação de Conta...");
    await sendEmailForEvent('ACCOUNT_CONFIRMATION', {
      toEmail: targetEmail,
      name: 'Usuário Teste',
      confirmationLink: 'http://localhost:3000/auth/confirm?token=123456'
    });

    // 2. Redefinição de Senha
    console.log("-> Testando Redefinição de Senha...");
    await sendEmailForEvent('PASSWORD_RESET', {
      toEmail: targetEmail,
      name: 'Usuário Teste',
      resetLink: 'http://localhost:3000/auth/reset?token=abcdef'
    });

    // 3. Vaga Encontrada (JOB_MATCH)
    console.log("-> Testando Vaga Encontrada...");
    await sendEmailForEvent('JOB_MATCH', {
      candidateEmail: targetEmail,
      candidateName: 'Usuário Teste',
      companyName: 'Tech Corp',
      jobTitle: 'Desenvolvedor Full Stack'
    });

    // 4. Candidatura Enviada
    console.log("-> Testando Candidatura Enviada (para o candidato)...");
    await sendEmailForEvent('CANDIDATE_APPLICATION_SENT', {
      candidateEmail: targetEmail,
      candidateName: 'Usuário Teste',
      jobTitle: 'Desenvolvedor Full Stack'
    });

    // 5. Candidatura Recebida
    console.log("-> Testando Candidatura Recebida (para a empresa)...");
    await sendEmailForEvent('COMPANY_APPLICATION_RECEIVED', {
      companyEmail: targetEmail, // Usando o mesmo email para testes
      candidateName: 'Usuário Teste',
      companyName: 'Tech Corp',
      jobTitle: 'Desenvolvedor Full Stack'
    });

    console.log("\nTodos os disparos foram realizados! Verifique a caixa de entrada (e o SPAM) de", targetEmail);

  } catch (error) {
    console.error("Erro durante os testes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllEmails();
