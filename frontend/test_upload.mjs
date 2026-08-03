import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Try to read from .env.local
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) process.env.NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1].trim();
  });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpload() {
  const fileName = `demo/test_demo_id/${Date.now()}-test.txt`;
  console.log('Uploading to:', fileName);
  
  const { data, error } = await supabase.storage.from('photos').upload(fileName, 'Hello World', {
    contentType: 'text/plain'
  });
  
  if (error) {
    console.error('Upload Error:', error);
  } else {
    console.log('Upload Success:', data);
  }

  // test DB insert
  const { data: dbData, error: dbError } = await supabase.from('demo_uploads').insert({
    demo_id: 'test_demo_id',
    url: 'http://test.com',
    type: 'image',
    caption: 'test',
    uploader: 'test'
  }).select();

  if (dbError) {
    console.error('DB Insert Error:', dbError);
  } else {
    console.log('DB Insert Success:', dbData);
  }
}

testUpload();
