import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateCSRF } from '@/lib/csrf';
import { EmailTemplates } from '@/lib/emailTemplates';

// Initialize with environment variable or fallback for local testing
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  if (!validateCSRF()) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const { to, subject: customSubject, html: customHtml, text: customText, template, templateData } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Missing required field (to)' }, { status: 400 });
    }

    let finalSubject = customSubject;
    let finalHtml = customHtml;
    
    if (template && EmailTemplates[template as keyof typeof EmailTemplates]) {
      const getTemplate = EmailTemplates[template as keyof typeof EmailTemplates] as any;
      const { subject, html } = getTemplate(...(templateData || []));
      finalSubject = subject;
      finalHtml = html;
    } else if (!customSubject) {
       return NextResponse.json({ error: 'Missing subject or valid template' }, { status: 400 });
    }

    // Attempt to send email
    const { data, error } = await resend.emails.send({
      from: 'Memento <hello@memento-app.com>', // Replace with verified domain
      to: typeof to === 'string' ? [to] : to,
      subject: finalSubject,
      html: finalHtml || `<p>${customText}</p>`,
      text: customText || (finalHtml || '').replace(/<[^>]*>?/gm, ''), // naive strip tags if only html provided
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
