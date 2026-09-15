import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'affcd7001@smtp-brevo.com',
      pass: process.env.BREVO_API_KEY, 
    },
  });
};

async function test() {
  console.log("Iniciando envio via nodemailer...");
  try {
    const transporter = createTransporter();
    
    let subject = 'Entrevista Marcada - Atlas Corp 🗓️';
    let bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #031225; padding: 30px; border-radius: 10px; border: 1px solid #00D9FF;">
  <h2 style="color: #00D9FF;">Olá, Candidato Teste!</h2>
  <p style="color: #EAF2FF; font-size: 16px;">Temos ótimas notícias! A empresa <strong>Atlas Corp</strong> agendou uma entrevista com você para a vaga de <strong>Desenvolvedor Full Stack</strong>.</p>
  <div style="background-color: #061A32; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📅 Data:</strong> 25/08/2026</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>⏰ Horário:</strong> 14:30</p>
    <p style="color: #EAF2FF; margin: 5px 0;"><strong>📍 Local / Link:</strong> https://meet.google.com/abc-defg-hij</p>
  </div>
  <p style="color: #8B9BB4;">Fique atento(a) ao horário e boa sorte na sua entrevista!</p>
</div>`;

    const info = await transporter.sendMail({
      from: '"SM Solutions" <atlasupi@gmail.com>',
      to: 'atlasupi@gmail.com',
      subject: subject,
      html: bodyHtml,
    });

    console.log("E-mail 1 enviado com sucesso. MessageId:", info.messageId);

    const info2 = await transporter.sendMail({
      from: '"SM Solutions" <atlasupi@gmail.com>',
      to: 'alysontrx@gmail.com',
      subject: 'Entrevista Marcada - SM Solutions 🗓️',
      html: bodyHtml,
    });
    console.log("E-mail 2 enviado com sucesso. MessageId:", info2.messageId);
    
  } catch (err) {
    console.error("Erro no envio:", err);
  }
}

test();
