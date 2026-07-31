import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { validateCSRF } from '@/lib/csrf';

const VALID_PLANS = ['STARTER', 'STANDARD', 'PREMIUM', 'WHITE_LABEL'];

function isValidPlan(plan: string): boolean {
  return VALID_PLANS.includes(plan?.toUpperCase?.());
}

async function upgradeEvent(eventId: string, plan: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !eventId) return;
  
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  
  const { error } = await admin
    .from('events')
    .update({ plan_type: plan })
    .eq('id', eventId)
    .select();
    
  if (error) {
    console.error('[verify] Error updating event:', error.message);
  }
}

async function upgradeProfile(userId: string, plan: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !userId) return;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  
  const { error } = await admin
    .from('profiles')
    .update({ 
      plan: plan.toLowerCase().replace(' ', '_'), 
      payment_status: 'paid' 
    })
    .eq('id', userId)
    .select();
    
  if (error) {
    console.error('[verify] Error updating profile:', error.message);
  }
}

export async function POST(req: NextRequest) {
  // CSRF Protection
  if (!await validateCSRF()) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const { paymentId, orderId, signature, plan, userId, eventId, mock } = await req.json();

  // Validate plan input
  if (plan && !isValidPlan(plan)) {
    return NextResponse.json({ error: 'Invalid plan specified' }, { status: 400 });
  }

  // Block mock payments in production
  if (mock) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Mock payments disabled in production' }, { status: 403 });
    }
    if (userId) await upgradeProfile(userId, plan);
    if (eventId) await upgradeEvent(eventId, plan);
    return NextResponse.json({ success: true, mock: true });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || keySecret.startsWith('your_')) {
    // Treat as success in development if mock is allowed
    if (process.env.NODE_ENV === 'development') {
      if (userId) await upgradeProfile(userId, plan);
      if (eventId) await upgradeEvent(eventId, plan);
      return NextResponse.json({ success: true, dev: true });
    }
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 });
  }

  // Verify Razorpay signature
  if (!paymentId || !orderId || !signature) {
    return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  if (userId) await upgradeProfile(userId, plan);
  if (eventId) await upgradeEvent(eventId, plan);
  return NextResponse.json({ success: true });
}
