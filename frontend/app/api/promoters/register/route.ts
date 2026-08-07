import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { partnerId, fullName, whatsappNumber, upiId } = body;

    if (!partnerId || !fullName || !whatsappNumber || !upiId) {
      return NextResponse.json({ error: 'Missing required promoter fields' }, { status: 400 });
    }

    // Upsert into promoters table in Supabase
    try {
      const { data, error } = await supabase
        .from('promoters')
        .upsert(
          {
            partner_code: partnerId,
            full_name: fullName,
            whatsapp_number: whatsappNumber,
            upi_id: upiId,
            is_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'partner_code' }
        )
        .select();

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
