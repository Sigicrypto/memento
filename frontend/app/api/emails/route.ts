import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateCSRF } from '@/lib/csrf';
import { rateLimit } from '@/lib/rateLimit';
import { EmailTemplates } from '@/lib/emailTemplates';

// Initialize with environment variable or a dummy key for build time
// The API key is validated inside the POST handler before sending
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

// Only allow template-based emails for security (no raw HTML injection)
const ALLOWED_TEMPLATES = Object.keys(EmailTemplates);

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!await validateCSRF()) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // 2. Rate limiting (10 emails per minute per IP)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rateLimit(ip, { maxRequests: 10, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { to, template, templateData } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Missing required field (to)' }, { status: 400 });
    }

    // Only allow template-based emails (no raw HTML/text to prevent injection)
    if (!template || !EmailTemplates[template as keyof typeof EmailTemplates]) {
      return NextResponse.json({ error: 'A valid email template is required' }, { status: 400 });
    }

    const getTemplate = EmailTemplates[template as keyof typeof EmailTemplates] as any;
    const { subject, html } = getTemplate(...(templateData || []));

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    // Attempt to send email
    const { data, error } = await resend.emails.send({
      from: 'Memento <hello@memento-app.com>',
      to: typeof to === 'string' ? [to] : to,
      subject,
      html,
      text: html.replace(/<[^>]*>?/gm, ''),
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
