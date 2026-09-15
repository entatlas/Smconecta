import { prisma } from '../src/lib/prisma'

async function main() {
  await prisma.subscriptionPlan.create({
    data: {
      name: 'Plano Pro',
      description: 'Ideal para quem busca se destacar no mercado.',
      price: 29.90,
      interval: 'MONTHLY',
      features: JSON.stringify(['Prioridade nas Vagas', 'Destaque no Perfil', 'Testes Comportamentais Avançados', 'Suporte Prioritário'])
    }
  });
  
  await prisma.subscriptionPlan.create({
    data: {
      name: 'Plano Premium',
      description: 'Para quem quer acesso completo e imediato.',
      price: 299.00,
      interval: 'YEARLY',
      features: JSON.stringify(['Tudo do Pro', 'Mentoria com Especialista', 'Análise de Currículo Personalizada', 'Acesso VIP a Eventos'])
    }
  });
  
  console.log('Seed de planos criado com sucesso!')
}

main().catch(e => console.error(e))
