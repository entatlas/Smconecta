const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email IN ('alysonanti1@gmail.com', 'atlasupi@gmail.com');`);
  console.log('Cleaned');
}

main().catch(console.error).finally(() => prisma.$disconnect());
