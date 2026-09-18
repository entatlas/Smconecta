import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function main() {
  const email = 'smsolucoesetreinamentos@gmail.com';
  const password = 'SMAF26097315@@';

  console.log(`Criando usuário admin com REST API: ${email}`);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Erro ao criar usuário:', data);
    if (data.msg !== 'User already registered') {
      process.exit(1);
    }
  }

  // Get user ID
  // If user already exists, we might need to find their ID from prisma directly or try to log in
  let userId = data?.user?.id || data?.id;

  if (!userId) {
     console.log('Usuário possivelmente já existe, buscando no banco...');
     const existingProfile = await prisma.profile.findFirst({
        where: { email }
     });
     if (existingProfile) {
         userId = existingProfile.auth_user_id;
     } else {
         // Query from auth.users via raw if profile not created
         const authUser: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM auth.users WHERE email = '${email}'`);
         if (authUser.length > 0) {
             userId = authUser[0].id;
         } else {
             console.error('Não foi possível encontrar o ID do usuário.');
             process.exit(1);
         }
     }
  }

  console.log(`Usuário ID: ${userId}`);
  console.log('Confirmando email no banco de dados...');

  try {
    await prisma.$executeRawUnsafe(`UPDATE auth.users SET email_confirmed_at = now(), raw_user_meta_data = '{"role":"ADMIN"}'::jsonb WHERE id = '${userId}'::uuid;`);
    console.log('Email confirmado.');
  } catch (err: any) {
    console.error('Erro ao confirmar email:', err.message);
  }

  console.log('Atualizando/Criando perfil como ADMIN...');

  try {
    const profile = await prisma.profile.upsert({
      where: { auth_user_id: userId },
      update: {
        tipo: 'ADMIN',
      },
      create: {
        auth_user_id: userId,
        email: email,
        nome: 'Administrador SM',
        tipo: 'ADMIN',
      },
    });
    console.log('Perfil configurado como ADMIN:', profile.id);
  } catch (err: any) {
    console.error('Erro ao configurar perfil:', err.message);
  }

  console.log('Finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
