import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_role_key_for_build'
);

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  try {
    const parts = header.split(',');
    let timestamp = '';
    const signatures: string[] = [];

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signatures.push(value);
    }

    if (!timestamp || signatures.length === 0) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return signatures.some((sig) => sig === expected);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (webhookSecret && !webhookSecret.startsWith('your_')) {
      if (!signature || !verifyStripeSignature(body, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {};
      const metadata = session.metadata || {};
      const eventId = metadata.eventId;
      const tier = metadata.tier || metadata.plan;

      if (eventId) {
        // Activate event in Supabase
        await supabaseAdmin
          .from('events')
          .update({
            status: 'ACTIVE',
            ...(tier ? { guest_tier: tier.toUpperCase() } : {}),
          })
          .eq('id', eventId);

        // Mark order paid
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid' })
          .eq('event_id', eventId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe-webhook] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
