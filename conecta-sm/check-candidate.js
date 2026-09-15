const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.lowmjvwwziczqpjksqrv:Alyson1lindo.@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT p.id, c.id as candidate_id FROM profiles p LEFT JOIN candidates c ON p.id = c.profile_id WHERE p.id = '7ff5580d-58bd-400a-8e43-0b756b442c35'`);
    console.log('Result:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
