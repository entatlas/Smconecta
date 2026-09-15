const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.aiLog.findMany({ orderBy: { createdAt: 'desc' }, take: 3 })
  .then(res => console.dir(res, {depth: null}))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
