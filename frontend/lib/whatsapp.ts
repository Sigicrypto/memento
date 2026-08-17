import https from 'https';

/**
 * Meta WhatsApp Cloud API Helper
 * Uses Meta's Official Graph API (Free 1,000 Conversations/Month)
 */
export async function sendWhatsAppCloudMessage({
  to,
  text,
}: {
  to: string;
  text: string;
}) {
  let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  let accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;

  if (phoneNumberId) {
    phoneNumberId = phoneNumberId.replace(/^["']|["']$/g, '').trim();
  }
  if (accessToken) {
    accessToken = accessToken.replace(/^["']|["']$/g, '').trim();
  }

  if (!phoneNumberId || !accessToken) {
    console.warn('WhatsApp Cloud API: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN missing');
    return {
      success: false,
      error: 'WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN missing in Vercel environment variables',
    };
  }

  // Format recipient phone number (remove +, spaces, dashes)
  const formattedPhone = to.replace(/[^0-9]/g, '');

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: true,
      body: text,
    },
  };

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error('Meta WhatsApp Cloud API Error:', data.error);
      return { success: false, error: data.error?.message || 'WhatsApp message failed' };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('WhatsApp API Fetch Error:', err);
    return { success: false, error: err.message || 'Network error sending WhatsApp message' };
  }
}
