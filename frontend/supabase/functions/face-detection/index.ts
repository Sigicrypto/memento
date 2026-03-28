import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Placeholder for a real face detection library
async function detectFaces(imageUrl: string): Promise<string[]> {
  console.log(`Detecting faces in ${imageUrl}`);
  // In a real implementation, you would use a proper face detection model.
  // For this placeholder, we'll just return 1 to 3 fake face encodings.
  const faceCount = Math.floor(Math.random() * 3) + 1;
  const fakeEncodings = Array.from({ length: faceCount }, () => `fake_encoding_${Math.random().toString(36).substring(2)}`);
  console.log(`Detected ${faceCount} faces.`);
  return Promise.resolve(fakeEncodings);
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { record: photo } = await req.json()

    if (!photo || !photo.storage_path) {
      throw new Error('Missing photo or storage_path in payload')
    }

    const { data: publicUrlData } = supabaseClient.storage.from('photos').getPublicUrl(photo.storage_path)

    if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Could not get public URL for photo')
    }

    const faceEncodings = await detectFaces(publicUrlData.publicUrl);

    if (faceEncodings.length > 0) {
      const faceRecords = faceEncodings.map(encoding => ({
        photo_id: photo.id,
        face_encoding: encoding,
      }));

      const { error: insertError } = await supabaseClient.from('faces').insert(faceRecords);
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ message: `Processed ${faceEncodings.length} faces for photo ${photo.id}.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
