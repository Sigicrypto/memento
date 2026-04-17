const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking photo_faces table schema via data sample...");
  // We'll insert a dummy row and then select it back to see the column names
  const { data, error } = await supabase.from('photo_faces').select('*').limit(1);
  if (error) {
     console.error("Error:", error);
  } else {
     console.log("Columns found:", Object.keys(data[0] || {}));
  }
}
check();
