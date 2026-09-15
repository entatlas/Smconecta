import { prisma } from './src/lib/prisma';

async function main() {
  console.log("Iniciando limpeza dos dados fictícios...");

  // Excluir vagas, eventos, histórias, etc que possam não estar atrelados a um perfil que será deletado
  const jobs = await prisma.job.deleteMany();
  const events = await prisma.calendarEvent.deleteMany();
  const stories = await prisma.inspiringStory.deleteMany();
  
  // Excluir perfis de teste (tudo exceto a conta do Alyson)
  // Devido ao onDelete: Cascade no Prisma (ou no banco), as empresas e candidatos vinculados a esses perfis também serão apagados
  const profiles = await prisma.profile.deleteMany({
    where: {
      email: {
        not: 'alysontrx@gmail.com'
      }
    }
  });

  console.log(`Deletados:`);
  console.log(`- ${jobs.count} Vagas`);
  console.log(`- ${profiles.count} Perfis (com Candidatos/Empresas vinculados)`);
  console.log(`- ${events.count} Eventos`);
  console.log(`- ${stories.count} Histórias`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
