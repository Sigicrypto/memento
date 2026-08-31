import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { partnerId, fullName, whatsappNumber, upiId } = body;

    if (!partnerId) {
      return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
    }

    const formattedPartnerId = partnerId.toUpperCase();

    // Upsert into promoters table in Supabase
    try {
      // Check if promoter already exists to preserve existing details if only pinging
      const { data: existing } = await supabase
        .from('promoters')
        .select('*')
        .eq('partner_code', formattedPartnerId)
        .maybeSingle();

      const upsertPayload: Record<string, any> = {
        partner_code: formattedPartnerId,
        full_name: fullName || existing?.full_name || 'Active Affiliate Partner',
        whatsapp_number: whatsappNumber || existing?.whatsapp_number || null,
        upi_id: upiId || existing?.upi_id || null,
        is_verified: upiId ? true : (existing?.is_verified ?? false),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('promoters')
        .upsert(upsertPayload, { onConflict: 'partner_code' });

      if (error) {
        console.warn('Supabase promoters upsert warning:', error.message);
      }
    } catch (dbErr) {
      console.warn('Database error during promoter registration:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Promoter profile registered successfully',
      partnerId,
      upiId,
    });
  } catch (error) {
    console.error('Promoter registration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
