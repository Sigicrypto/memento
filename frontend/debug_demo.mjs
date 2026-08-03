import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) process.env.NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1].trim();
  });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('demo_uploads').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Latest 5 uploads:', data);
  if (data && data.length > 0) {
    const demoId = data[0].demo_id;
    console.log(`Checking specifically for demoId: ${demoId}`);
    const { data: specificData } = await supabase.from('demo_uploads').select('*').eq('demo_id', demoId);
    console.log(`Found ${specificData?.length} photos for this demo_id.`);
  }
}

check();
