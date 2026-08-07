import { NextResponse } from 'next/server';
import { publishToMeta } from '@/lib/metaSocial';

export async function POST(request: Request) {
  try {
    const { caption, imageUrl, target = 'both' } = await request.json();

    const results = await publishToMeta({
      caption,
      imageUrl,
      target,
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
