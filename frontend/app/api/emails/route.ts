import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize with environment variable or fallback for local testing
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields (to, subject)' }, { status: 400 });
    }

    // Attempt to send email
    const { data, error } = await resend.emails.send({
      from: 'Memento <hello@memento-app.com>', // Replace with verified domain
      to: typeof to === 'string' ? [to] : to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text || html.replace(/<[^>]*>?/gm, ''), // naive strip tags if only html provided
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
