import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.emailTemplate.findMany();
  console.log("TEMPLATES NO BANCO:");
  console.log(templates);
  
  const integration = await prisma.integration.findUnique({
    where: { type: 'EMAIL' }
  });
  console.log("STATUS DA INTEGRAÇÃO DE EMAIL:");
  console.log(integration);
}

main().catch(console.error).finally(() => prisma.$disconnect());
