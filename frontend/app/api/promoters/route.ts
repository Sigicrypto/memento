import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.data');
const CACHE_FILE = path.join(CACHE_DIR, 'promoters.json');

function getLocalPromoters(): Record<string, any> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(content || '{}');
    }
  } catch (e) {
    console.warn('Error reading local promoters cache:', e);
  }
  return {};
}

function saveLocalPromoters(data: Record<string, any>) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error saving local promoters cache:', e);
  }
}

export async function GET() {
  try {
    const localData = getLocalPromoters();
    const promotersMap: Record<string, any> = { ...localData };

    // Also attempt to fetch from Supabase if table exists
    try {
      const { data: dbPromoters, error } = await supabase
        .from('promoters')
        .select('*');

      if (!error && Array.isArray(dbPromoters)) {
        dbPromoters.forEach((p: any) => {
          if (p.partner_code) {
            promotersMap[p.partner_code.toUpperCase()] = {
              ...promotersMap[p.partner_code.toUpperCase()],
              ...p,
            };
          }
        });
      }
    } catch (dbErr) {
      console.warn('Supabase promoters table check note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      promoters: Object.values(promotersMap),
    });
  } catch (error: any) {
    console.error('Error fetching promoters list:', error);
    return NextResponse.json({ success: true, promoters: Object.values(getLocalPromoters()) });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { partnerId, fullName, whatsappNumber, upiId } = body;

    if (!partnerId) {
      return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
    }

    const formattedCode = partnerId.toUpperCase();
    const localData = getLocalPromoters();
    const existing = localData[formattedCode] || {};

    const promoterRecord = {
      partner_code: formattedCode,
      full_name: fullName || existing.full_name || 'Active Affiliate Partner',
      whatsapp_number: whatsappNumber || existing.whatsapp_number || null,
      upi_id: upiId || existing.upi_id || null,
      is_verified: upiId ? true : (existing.is_verified ?? false),
      updated_at: new Date().toISOString(),
      created_at: existing.created_at || new Date().toISOString(),
    };

    localData[formattedCode] = promoterRecord;
    saveLocalPromoters(localData);

    // Also attempt to persist in Supabase if table exists
    try {
      await supabase
        .from('promoters')
        .upsert(promoterRecord, { onConflict: 'partner_code' });
    } catch (dbErr) {
      console.warn('Supabase promoters db upsert note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Promoter registered successfully',
      promoter: promoterRecord,
    });
  } catch (error: any) {
    console.error('Promoters API POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
