import { NextResponse } from 'next/server';
import { sendWhatsAppCloudMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { phone, businessName, templateMessage } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Lead phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // 1. Direct WhatsApp Click-to-Chat Link (100% Free - Works Always)
    const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(templateMessage)}`;

    // 2. Attempt Background Automated Send via Meta Cloud API
    const apiResult = await sendWhatsAppCloudMessage({
      to: cleanPhone,
      text: templateMessage,
    });

    if (apiResult.success) {
      return NextResponse.json({
        success: true,
        mode: 'automated_cloud_api',
        whatsappWebUrl,
        apiResult,
        message: 'Automated 24/7 background WhatsApp message sent via Meta Cloud API!',
      });
    }

    // Fallback to direct click-to-chat if API token is not configured yet
    return NextResponse.json({
      success: true,
      mode: 'direct_click_to_chat',
      whatsappWebUrl,
      message: 'Direct WhatsApp 1-click link ready! Click to open chat in WhatsApp Web/App.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'WhatsApp dispatch failed' }, { status: 500 });
  }
}
