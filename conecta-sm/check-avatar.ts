import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, nome, avatar_url').eq('id', 'e1763033-1dac-48b8-9927-bc2088254ac2').single();
  if (error) console.error(error);
  else {
    console.log('Profile:', data.nome);
    console.log('Avatar URL length:', data.avatar_url ? data.avatar_url.length : 0);
    console.log('Avatar URL preview:', data.avatar_url ? data.avatar_url.substring(0, 50) + '...' : 'null');
  }
}
run();
