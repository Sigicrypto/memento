import { NextResponse } from 'next/server';
import { sendWhatsAppCloudMessage } from '@/lib/whatsapp';

/**
 * Meta WhatsApp Cloud API Webhook Route
 * GET: Meta Webhook Token Verification
 * POST: Automated 24/7 Background Instant Auto-Responder
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'memento_whatsapp_verify_secret';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Meta WhatsApp Webhook Verified Successfully!');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if webhook is from WhatsApp messaging
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.from) {
      const senderPhone = message.from;
      const incomingText = message.text?.body || '';

      console.log(`Incoming WhatsApp Message from ${senderPhone}: "${incomingText}"`);

      // Automated 24/7 Instant Auto-Responder Text
      const autoReplyText = `🎉 Hi there! Thanks for reaching out to Memento Live QR Photo Wall 📸

We bring interactive live guest photo streaming to weddings, corporate galas & private parties across India!

✨ Zero App Downloads Needed for Guests
📱 Instant Live TV Screen Slideshow
🎨 Custom Branding & Corporate Logos

👇 Click below to test our interactive 1-click live demo:
https://mymementoapp.com/demo

📞 Need an instant event quote? Reply with your Event Date & City!`;

      // Trigger 100% Free Meta Cloud API Response
      await sendWhatsAppCloudMessage({
        to: senderPhone,
        text: autoReplyText,
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('WhatsApp Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
