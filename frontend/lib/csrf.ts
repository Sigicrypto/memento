import { headers } from 'next/headers';

export function validateCSRF(): boolean {
  const headersList = headers();
  const origin = headersList.get('origin');
  const referer = headersList.get('referer');
  const host = headersList.get('host');

  // Next.js development server
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const expectedDomain = process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`;

  if (origin && !origin.startsWith(expectedDomain)) {
    return false;
  }

  if (referer && !referer.startsWith(expectedDomain)) {
    return false;
  }

  return true;
}
