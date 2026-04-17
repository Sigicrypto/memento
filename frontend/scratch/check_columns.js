const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking table column types...");
  const { data, error } = await supabase.rpc('get_table_columns_info', { t_name: 'photo_faces' });
  if (error) {
     // If RPC doesn't exist, we'll try a different approach
     console.error("RPC Error:", error.message);
  } else {
     console.log("Columns:", data);
  }
}
check();
