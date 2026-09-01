import { NextResponse } from 'next/server';
import { POST as handlePromoterPost } from '../route';

export async function POST(req: Request) {
  return handlePromoterPost(req);
}
