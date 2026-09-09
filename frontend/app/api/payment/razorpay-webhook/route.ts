import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_role_key_for_build'
);

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (webhookSecret && !webhookSecret.startsWith('your_')) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(body);
    const eventType = payload.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};
      const eventId = notes.eventId;
      const tier = notes.tier || notes.plan;

      if (eventId) {
        // Activate event
        await supabaseAdmin
          .from('events')
          .update({
            status: 'ACTIVE',
            ...(tier ? { guest_tier: tier.toUpperCase() } : {}),
          })
          .eq('id', eventId);

        // Mark corresponding order as paid
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid' })
          .eq('event_id', eventId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[razorpay-webhook] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
