import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const c = await prisma.profile.findFirst({ where: { id: 'e1763033-1dac-48b8-9927-bc2088254ac2' }});
  console.log(c ? Object.keys(c) : 'not found');
  console.log('avatarUrl:', c?.avatarUrl ? c.avatarUrl.substring(0, 20) : 'falsy');
  await prisma.$disconnect();
}
run();
