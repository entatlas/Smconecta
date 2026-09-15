import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { sendWelcomeEmail } from './src/app/cadastro/actions';

async function runTest() {
  console.log('Testando sendWelcomeEmail com Brevo API...');
  const result = await sendWelcomeEmail('alysontrx@gmail.com', 'Teste de Sistema', 'CANDIDATE');
  console.log('Resultado:', result);
}

runTest();
