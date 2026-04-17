import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://claxpvhaxmttujntulmu.supabase.co';
const supabaseKey = 'Sigicrypto786'; // NOT A SERVICE KEY, BUT I CAN TRY TO GET PUBLIC EVENTS
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, slug')
    .limit(5);

  if (error) {
    console.error('Error fetching events:', error);
  } else {
    console.log('Events in DB:', data);
  }
}

checkSlugs();
