import { NextResponse } from 'next/server';

// This route has been disabled.
// Image optimization is handled by Next.js <Image> component automatically.

export async function GET() {
  return new NextResponse('This endpoint is disabled', { status: 404 });
}
