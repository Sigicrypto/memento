import { NextResponse } from 'next/server';
import { generateRandomCampaign, publishToMeta } from '@/lib/metaSocial';

export async function GET(request: Request) {
  try {
    // Pick a random category out of wedding, corporate, birthday, product, hiring
    const categories = ['wedding', 'corporate', 'birthday', 'product', 'hiring'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Generate fresh AI variation
    const variation = generateRandomCampaign(randomCategory);

    // Publish to Facebook & Instagram automatically
    const results = await publishToMeta({
      caption: variation.caption,
      imageUrl: variation.imageUrl,
      target: 'both',
    });

    console.log('Cron Auto-Pilot Post Published:', {
      category: randomCategory,
      results,
    });

    return NextResponse.json({
      success: true,
      mode: 'Hands-Free Daily Auto-Pilot (HD Photo Campaigns)',
      category: randomCategory,
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
