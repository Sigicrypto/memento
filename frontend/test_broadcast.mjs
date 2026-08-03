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

const supabase1 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const supabase2 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const demoId = 'test_demo_id';

async function testBroadcast() {
  console.log('Testing Broadcast...');
  
  // Client 1: Listener (Demo Wall)
  const bcastChannel = supabase1.channel(`demo-${demoId}`);
  bcastChannel.on('broadcast', { event: 'NEW_UPLOAD' }, (payload) => {
    console.log('Listener received broadcast:', payload);
    process.exit(0);
  });
  bcastChannel.subscribe((status) => {
    console.log('Listener status:', status);
    if (status === 'SUBSCRIBED') {
      // Client 2: Sender (Upload Page)
      const senderChannel = supabase2.channel(`demo-${demoId}`);
      senderChannel.subscribe(async (sStatus) => {
        console.log('Sender status:', sStatus);
        if (sStatus === 'SUBSCRIBED') {
          console.log('Sending broadcast...');
          const resp = await supabase2.channel(`demo-${demoId}`).send({
            type: 'broadcast',
            event: 'NEW_UPLOAD',
            payload: { url: 'test', type: 'image' },
          });
          console.log('Send response:', resp);
        }
      });
    }
  });

  setTimeout(() => {
    console.error('Timeout! Broadcast failed.');
    process.exit(1);
  }, 5000);
}

testBroadcast();
