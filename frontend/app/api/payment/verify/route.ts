import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

async function upgradeEvent(eventId: string, plan: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !eventId) {
    console.error('[verify] Missing serviceKey or eventId:', { eventId, hasServiceKey: !!serviceKey });
    return;
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  
  console.log('[verify] Upgrading event:', eventId, 'to plan:', plan);
  const { data, error } = await admin
    .from('events')
    .update({ plan_type: plan })
    .eq('id', eventId)
    .select();
    
  if (error) {
    console.error('[verify] Error updating event:', error);
  } else {
    console.log('[verify] Event upgraded successfully:', data);
  }
}

async function upgradeProfile(userId: string, plan: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !userId) {
    console.error('[verify] Missing serviceKey or userId:', { userId, hasServiceKey: !!serviceKey });
    return;
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  
  console.log('[verify] Upgrading user profile:', userId, 'to plan:', plan);
  const { data, error } = await admin
    .from('profiles')
    .update({ 
      plan: plan.toLowerCase().replace(' ', '_'), 
      payment_status: 'paid' 
    })
    .eq('id', userId)
    .select();
    
  if (error) {
    console.error('[verify] Error updating profile:', error);
  } else {
    console.log('[verify] Profile upgraded successfully:', data);
  }
}

export async function POST(req: NextRequest) {
  const { paymentId, orderId, signature, plan, userId, eventId, mock } = await req.json();

  // If mock mode is explicitly requested or keys are missing, we skip signature verification
  if (mock) {
    console.log('[verify] Mock payment successful for user:', userId, 'event:', eventId, 'plan:', plan);
    if (userId) await upgradeProfile(userId, plan);
    if (eventId) await upgradeEvent(eventId, plan);
    return NextResponse.json({ success: true, mock: true });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || keySecret.startsWith('your_')) {
    // Treat as success in development if mock is allowed
    if (process.env.NODE_ENV === 'development') {
      console.log('[verify] Dev mode: treating as mock success');
      if (userId) await upgradeProfile(userId, plan);
      if (eventId) await upgradeEvent(eventId, plan);
      return NextResponse.json({ success: true, dev: true });
    }
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

  if (userId) await upgradeProfile(userId, plan);
  if (eventId) await upgradeEvent(eventId, plan);
  return NextResponse.json({ success: true });
}
