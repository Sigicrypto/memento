const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("--- FINAL DATABASE DIAGNOSIS ---");
  
  // 1. Try to fetch a photo ID to use as a dummy reference
  const { data: photos } = await supabase.from('photos').select('id, event_id').limit(1);
  if (!photos || photos.length === 0) {
    console.error("ERROR: No photos in DB. Please upload a photo first.");
    return;
  }
  const photoId = photos[0].id;
  const eventId = photos[0].event_id;
  
  console.log(`Testing with Photo ID: ${photoId} and Event ID: ${eventId}`);

  // 2. Test Insert into photo_faces
  const { error: insertError } = await supabase.from('photo_faces').insert({
    photo_id: photoId,
    event_id: eventId,
    descriptor: new Array(128).fill(0.1) // 128-float vector
  });

  if (insertError) {
    console.error("INSERT FAILED:", insertError.message, insertError.code);
    if (insertError.code === '22023') {
       console.error("HINT: This usually means the 'descriptor' column is not a 'vector(128)'.");
    }
  } else {
    console.log("SUCCESS: Insert worked! RLS is fine.");
    
    // 3. Test RPC match_photo_faces
    const { data: matchData, error: matchError } = await supabase.rpc('match_photo_faces', {
      query_embedding: new Array(128).fill(0.1),
      match_threshold: 0.5,
      match_count: 5,
      target_event_id: eventId
    });
    
    if (matchError) {
      console.error("RPC MATCH FAILED:", matchError.message);
    } else {
      console.log("SUCCESS: RPC Match worked! Found:", matchData.length, "results.");
    }
    
    // Cleanup
    await supabase.from('photo_faces').delete().eq('photo_id', photoId);
  }
}
test();
