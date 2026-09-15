import { config } from 'dotenv';
config();
import { sendEmailForEvent } from './src/lib/events/EmailService';
async function test() {
  console.log("Iniciando envio de email de teste...");
  try {
    await sendEmailForEvent('INTERVIEW_SCHEDULED', {
      candidateEmail: 'atlasupi@gmail.com',
      candidateName: 'Candidato Teste (Atlas)',
      jobTitle: 'Desenvolvedor Full Stack',
      companyName: 'Atlas Corp',
      date: '25/08/2026',
      time: '14:30',
      locationOrLink: 'https://meet.google.com/abc-defg-hij'
    });
    
    await sendEmailForEvent('INTERVIEW_SCHEDULED', {
      candidateEmail: 'alysontrx@gmail.com',
      candidateName: 'Candidato Teste (Alyson)',
      jobTitle: 'Engenheiro de Software',
      companyName: 'SM Solutions',
      date: '26/08/2026',
      time: '10:00',
      locationOrLink: 'Rua Fictícia, 123 - Sala 4'
    });
    console.log('Testes finalizados!');
  } catch (err) {
    console.error("Erro no teste:", err);
  }
}

test();
