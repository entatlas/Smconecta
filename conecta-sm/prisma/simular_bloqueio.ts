import { prisma } from '../src/lib/prisma'

async function main() {
  await prisma.candidate.updateMany({
    data: { subscriptionStatus: 'CANCELED' }
  });
  console.log('Status de candidatos alterado para CANCELED para simular o bloqueio!');
}

main().catch(console.error);
