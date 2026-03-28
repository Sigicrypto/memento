import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Placeholder for Google Drive API interaction
async function uploadToGoogleDrive(fileName: string, fileContent: ArrayBuffer) {
  console.log(`Uploading ${fileName} to Google Drive...`);
  // In a real implementation, you would use the Google Drive API.
  // This would involve setting up OAuth2 credentials and using a library like `googleapis`.
  // For this placeholder, we'll just log the action.
  console.log(`Successfully uploaded ${fileName} to Google Drive.`);
  return Promise.resolve({ id: `fake-drive-id-${Math.random()}` });
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { record: photo } = await req.json()

    if (!photo || !photo.event_id || !photo.storage_path) {
      throw new Error('Missing photo, event_id, or storage_path in payload')
    }

    // 1. Check if Google Drive sync is enabled for the event
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('google_drive_sync_enabled, name')
      .eq('id', photo.event_id)
      .single()

    if (eventError) throw eventError
    if (!event?.google_drive_sync_enabled) {
      return new Response(JSON.stringify({ message: 'Google Drive sync not enabled for this event' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Download the photo from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('photos')
      .download(photo.storage_path);

    if (downloadError) throw downloadError;

    const fileContent = await fileData.arrayBuffer();
    const fileName = photo.storage_path.split('/').pop() || `photo-${photo.id}`;

    // 3. Upload to Google Drive (using placeholder function)
    await uploadToGoogleDrive(fileName, fileContent);

    return new Response(JSON.stringify({ message: `Photo ${photo.id} synced to Google Drive.` }), {
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
