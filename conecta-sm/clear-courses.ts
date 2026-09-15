import { prisma } from './src/lib/prisma';

async function main() {
  const deleted = await prisma.course.deleteMany();
  console.log(`Deletados ${deleted.count} cursos com sucesso.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // some adapters don't have $disconnect, just process.exit if needed
    process.exit(0);
  });
