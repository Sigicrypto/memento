import { NextResponse } from 'next/server';
import { generateRandomCampaign, publishToMeta } from '@/lib/metaSocial';

export async function GET(request: Request) {
  try {
    // Pick a random category out of wedding, corporate, birthday, product
    const categories = ['wedding', 'corporate', 'birthday', 'product'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Generate fresh AI variation (mix of Photo & MP4 Video Reel)
    const variation = generateRandomCampaign(randomCategory, 'MIX');

    // Publish to Facebook & Instagram automatically
    const results = await publishToMeta({
      caption: variation.caption,
      imageUrl: variation.imageUrl,
      videoUrl: variation.videoUrl,
      mediaType: variation.mediaType,
      target: 'both',
    });

    console.log('Cron Auto-Pilot Post Published:', {
      category: randomCategory,
      mediaType: variation.mediaType,
      results,
    });

    return NextResponse.json({
      success: true,
      mode: 'Hands-Free Daily Auto-Pilot (Photos & MP4 Reels)',
      category: randomCategory,
      mediaType: variation.mediaType,
      variation,
      results,
    });
  } catch (error: any) {
    console.error('Cron Auto-Pilot Error:', error);
    return NextResponse.json({ error: error.message || 'Auto-pilot publishing failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
