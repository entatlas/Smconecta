const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.lowmjvwwziczqpjksqrv:Alyson1lindo.@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lowmjvwwziczqpjksqrv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-Hx-oIo2BGiwCrlIB1ffWA_Ibb7KN9v';

async function main() {
  const email = 'smsolucoesetreinamentos@gmail.com';
  const password = 'SMAF26097315@@';

  console.log(`Criando usuário admin via REST API e DB direto: ${email}`);

  // 1. Criar Auth
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

  if (!res.ok && data.msg !== 'User already registered') {
    console.error('Erro ao criar usuário Auth:', data);
    process.exit(1);
  }

  let userId = data?.user?.id || data?.id;

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  if (!userId) {
     console.log('Buscando usuário no DB...');
     const result = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
     if (result.rows.length > 0) {
        userId = result.rows[0].id;
     } else {
        console.error('Usuário não encontrado!');
        process.exit(1);
     }
  }

  console.log(`User ID: ${userId}`);
  console.log('Confirmando email...');
  
  await client.query(`UPDATE auth.users SET email_confirmed_at = now(), raw_user_meta_data = '{"role":"ADMIN"}'::jsonb WHERE id = $1`, [userId]);

  console.log('Atualizando Profile para ADMIN...');
  
  const profileRes = await client.query(`SELECT id FROM profiles WHERE auth_user_id = $1`, [userId]);
  
  if (profileRes.rows.length > 0) {
      await client.query(`UPDATE profiles SET tipo = 'ADMIN', nome = 'Administrador SM' WHERE auth_user_id = $1`, [userId]);
  } else {
      const crypto = require('crypto');
      const newId = crypto.randomUUID();
      await client.query(
          `INSERT INTO profiles (id, auth_user_id, email, nome, tipo, status, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now())`,
          [newId, userId, email, 'Administrador SM', 'ADMIN', 'ACTIVE']
      );
  }

  console.log('Pronto! Administrador configurado com sucesso.');
  await client.end();
}

main().catch(console.error);
