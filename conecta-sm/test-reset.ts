import { sendEmailForEvent } from './src/lib/events/EmailService';

async function test() {
  console.log("Reenviando apenas Redefinição de Senha...");
  try {
    await sendEmailForEvent('PASSWORD_RESET', {
      toEmail: 'alysontrx@gmail.com',
      name: 'Alyson',
      resetLink: 'http://localhost:3000/auth/reset?token=novotoken123'
    });
    console.log("Enviado.");
  } catch (err) {
    console.error(err);
  }
}
test();
