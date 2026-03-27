import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

async function upgradePlan(userId: string, plan: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !userId) return;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { plan_type: plan },
  });
}

export async function POST(req: NextRequest) {
  const { paymentId, orderId, signature, plan, userId } = await req.json();

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || keySecret.startsWith('your_')) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 });
  }

  // Verify Razorpay signature
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  await upgradePlan(userId, plan);
  return NextResponse.json({ success: true });
}
