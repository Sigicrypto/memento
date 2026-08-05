/**
 * Helper to get the canonical site base URL.
 * Prefers process.env.NEXT_PUBLIC_SITE_URL, then window.location.origin, defaulting to https://mymementoapp.com
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('your-production-domain')) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://mymementoapp.com';
}
