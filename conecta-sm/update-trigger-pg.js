const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.lowmjvwwziczqpjksqrv:Alyson1lindo.@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync('supabase-trigger.sql', 'utf8');
    await client.query(sql);
    console.log('Trigger successfully updated using pg client!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
