import { NextResponse } from 'next/server';
import { publishToMeta } from '@/lib/metaSocial';

export async function POST(request: Request) {
  try {
    const { caption, imageUrl, videoUrl, mediaType = 'IMAGE', target = 'both' } = await request.json();

    const results = await publishToMeta({
      caption,
      imageUrl,
      videoUrl,
      mediaType,
      target,
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
