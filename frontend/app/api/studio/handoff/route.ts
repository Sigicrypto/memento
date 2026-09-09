import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rateLimit(ip, { maxRequests: 15, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { clientEmail, clientName, eventName, slug, guestUploadUrl, liveWallUrl } = await req.json();

    if (!clientEmail || !eventName || !slug) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('your_')) {
      // In dev or without API key, return mock success
      return NextResponse.json({ success: true, mock: true });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #fafaf8; border-radius: 12px; border: 1px solid #e8e6e1;">
        <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">Your Memento Event Kit is Ready! 🎉</h1>
        <p style="font-size: 15px; color: #5c5c5c; line-height: 1.6;">
          Hi ${clientName || 'there'},<br/><br/>
          Your live photo sharing kit for <strong>${eventName}</strong> has been configured.
        </p>

        <div style="background: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 15px; color: #c8963e;">📸 1. Guest Camera & Upload Link</h3>
          <p style="font-size: 13px; color: #5c5c5c; margin-bottom: 8px;">Guests can scan or tap this link to snap and upload directly from their mobile browser without downloading any apps:</p>
          <a href="${guestUploadUrl}" style="font-size: 14px; font-weight: bold; color: #0891a8; word-break: break-all;">${guestUploadUrl}</a>
        </div>

        <div style="background: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 15px; color: #c8963e;">📺 2. Venue Reception Live Wall</h3>
          <p style="font-size: 13px; color: #5c5c5c; margin-bottom: 8px;">Open this link in full-screen on any TV, projector, or display screen connected to a browser:</p>
          <a href="${liveWallUrl}" style="font-size: 14px; font-weight: bold; color: #0891a8; word-break: break-all;">${liveWallUrl}</a>
        </div>

        <p style="font-size: 13px; color: #9b9b9b; margin-top: 24px;">
          Captured live with Memento • Have an unforgettable celebration!
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Memento <hello@memento-app.com>',
      to: [clientEmail],
      subject: `Your Live Photo Sharing Kit: ${eventName} 🎉`,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
