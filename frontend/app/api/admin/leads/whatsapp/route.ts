import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, businessName, templateMessage } = await request.json();

    const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!phone) {
      return NextResponse.json({ error: 'Lead phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Format direct WhatsApp chat link for instant zero-friction outreach
    const whatsappWebUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(templateMessage)}`;

    if (!pageToken || !whatsappPhoneId) {
      return NextResponse.json({
        success: true,
        mode: 'direct_chat_link',
        whatsappWebUrl,
        message: 'Direct WhatsApp link generated! Click to open chat in WhatsApp Web/App.',
      });
    }

    // Call Meta WhatsApp Business Cloud API if WHATSAPP_PHONE_NUMBER_ID is configured
    const waRes = await fetch(`https://graph.facebook.com/v20.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pageToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: templateMessage },
      }),
    });

    const data = await waRes.json();

    return NextResponse.json({
      success: true,
      mode: 'cloud_api',
      whatsappWebUrl,
      result: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'WhatsApp dispatch failed' }, { status: 500 });
  }
}
