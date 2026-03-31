import { NextRequest, NextResponse } from 'next/server';

const PRICES_INR: Record<string, number> = {
  STARTER: 2500, PRO: 5000, PREMIUM: 7500, WHITE_LABEL: 10000,
};
const PRICES_USD: Record<string, number> = {
  STARTER: 30, PRO: 60, PREMIUM: 90, WHITE_LABEL: 120,
};
const PLAN_NAMES: Record<string, string> = {
  STARTER: 'Memento Starter', PRO: 'Memento Pro',
  PREMIUM: 'Memento Premium', WHITE_LABEL: 'Memento White Label',
};

export async function POST(req: NextRequest) {
  const { plan, region, userId, userEmail } = await req.json();
  const planKey = (plan || 'PRO').toUpperCase().replace(' ', '_');

  // ── Razorpay (India) ──────────────────────────────────────────
  if (region === 'IN') {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.startsWith('your_')) {
      return NextResponse.json({ mock: true });
    }

    const amount = (PRICES_INR[planKey] ?? 5000) * 100; // paise
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `memento_${planKey}_${Date.now()}`,
        notes: { plan: planKey, userId: userId || '' },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.description || 'Razorpay error' }, { status: 500 });
    }

    const order = await res.json();
    return NextResponse.json({
      gateway: 'razorpay',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      planLabel: PLAN_NAMES[planKey] || planKey,
    });
  }

  // ── Stripe (Global) ───────────────────────────────────────────
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.startsWith('your_')) {
    return NextResponse.json({ mock: true });
  }

  const amount = (PRICES_USD[planKey] ?? 60) * 100; // cents
  const origin = req.headers.get('origin') || req.nextUrl.origin;

  const params = new URLSearchParams({
    'payment_method_types[0]': 'card',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': PLAN_NAMES[planKey] || planKey,
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][quantity]': '1',
    mode: 'payment',
    success_url: `${origin}/checkout/success?plan=${planKey}`,
    cancel_url: `${origin}/#pricing`,
    'metadata[plan]': planKey,
    'metadata[userId]': userId || '',
  });
  if (userEmail) params.set('customer_email', userEmail);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${secretKey}`,
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || 'Stripe error' }, { status: 500 });
  }

  const session = await res.json();
  return NextResponse.json({ gateway: 'stripe', sessionUrl: session.url });
}
