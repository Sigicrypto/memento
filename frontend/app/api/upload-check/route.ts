import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { honeypot } = body;

    if (honeypot) {
      // Bot detected
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, retryAfter } = rateLimit(ip, { maxRequests: 20, windowMs: 60000 });

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
