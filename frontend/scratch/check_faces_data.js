const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking photo_faces table for ANY data...");
  const { data, error } = await supabase.from('photo_faces').select('id, photo_id, event_id').limit(10);
  if (error) {
     console.error("Database Error:", error);
  } else {
     console.log("Found", data.length, "rows in photo_faces.");
     if (data.length > 0) {
       console.log("Sample Data:", data);
     }
  }
}
check();
