const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const eventId = '9fd19c4c-2a01-42a8-b3e7-b91311219277';
  const { data, error } = await supabase.from('events').select('slug, plan_type').eq('id', eventId).single();
  if (error) {
     console.error("Database Error:", error);
  } else {
     console.log("Target Event Plan:", data);
  }
}
check();
