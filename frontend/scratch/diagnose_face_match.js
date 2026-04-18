const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bywmurlwuclszpyayjvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d211cmx3dWNsc3pweWF5anZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMwNTQsImV4cCI6MjA4OTg0OTA1NH0.7Y-EJv7nkyar3hMo2jJt5Bcq_JARHieJZG3y-6cfwxg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("=== FACE MATCHING DIAGNOSIS ===\n");
  
  // 1. Get all face descriptors
  const { data: faces, error } = await supabase
    .from('photo_faces')
    .select('id, photo_id, descriptor, created_at')
    .order('created_at', { ascending: false });
  
  if (error) { console.error("Error:", error.message); return; }
  console.log("Total faces indexed:", faces.length);
  
  for (const row of faces) {
    const vals = row.descriptor.replace(/[\[\]]/g, '').split(',').map(Number);
    const isDummy = vals.every(v => Math.abs(v - 0.1) < 0.001);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    console.log("  ID:", row.id);
    console.log("  Photo:", row.photo_id);
    console.log("  IsDummy:", isDummy, "| Length:", vals.length, "| Range: [" + min.toFixed(4) + ", " + max.toFixed(4) + "] | Mean:", mean.toFixed(4));
    console.log("  First 8 values:", vals.slice(0, 8).map(v => v.toFixed(4)).join(', '));
    console.log("");
  }
  
  // 2. Test with the real descriptor at different thresholds
  if (faces.length > 0) {
    const realFace = faces.find(f => {
      const vals = f.descriptor.replace(/[\[\]]/g, '').split(',').map(Number);
      return !vals.every(v => Math.abs(v - 0.1) < 0.001);
    });
    
    if (realFace) {
      const realVals = realFace.descriptor.replace(/[\[\]]/g, '').split(',').map(Number);
      console.log("--- Testing similarity thresholds with real descriptor ---");
      
      // Add small noise to simulate variation
      for (const noiseLevel of [0, 0.01, 0.05, 0.1, 0.2]) {
        const noisy = realVals.map(v => v + (Math.random() - 0.5) * 2 * noiseLevel);
        
        for (const threshold of [0.9, 0.7, 0.5, 0.35, 0.2, 0.1]) {
          const { data: matches, error: matchErr } = await supabase.rpc('match_photo_faces', {
            query_embedding: noisy,
            match_threshold: threshold,
            match_count: 50,
            target_event_id: '9fd19c4c-2a01-42a8-b3e7-b91311219277'
          });
          
          if (matchErr) {
            console.log("  Noise:", noiseLevel, "| Threshold:", threshold, "| ERROR:", matchErr.message);
          } else {
            const sims = matches.map(m => m.similarity.toFixed(4));
            console.log("  Noise:", noiseLevel, "| Threshold:", threshold, "| Matches:", matches.length, "| Similarities:", sims.join(', '));
          }
        }
        console.log("");
      }
    } else {
      console.log("WARNING: All descriptors are dummy data! No real face descriptors in the database.");
    }
  }
  
  // 3. Count total photos vs indexed faces
  const { count: totalPhotos } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', '9fd19c4c-2a01-42a8-b3e7-b91311219277');
  
  console.log("\n--- Coverage ---");
  console.log("Total photos in event:", totalPhotos);
  console.log("Total face descriptors:", faces.length);
  console.log("Coverage:", totalPhotos > 0 ? ((faces.length / totalPhotos) * 100).toFixed(0) + "%" : "N/A");
}

diagnose();
