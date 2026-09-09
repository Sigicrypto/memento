export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: { inr: string; usd: string };
  period?: string;
  highlight?: boolean;
  stats: string;
  description: string;
  tagline: string;
  iconColor: string;
  features: PlanFeature[];
  badge?: string;
}

// Legacy plans kept for backward compatibility with existing dashboard
export const PLANS: Plan[] = [
  {
    id: 'small',
    name: 'SMALL EVENT',
    price: { inr: '₹999', usd: '$15' },
    period: '/event',
    iconColor: 'text-cyan-400',
    description: 'Up to 100 guests',
    tagline: 'Ideal for intimate weddings, dinners, and private birthday parties.',
    stats: 'Up to 100 Guests',
    features: [
      { label: 'Unlimited photos & videos', included: true },
      { label: 'Interactive Live Photo Wall', included: true },
      { label: 'Host moderation console', included: true },
      { label: 'Custom couple & studio branding', included: true },
      { label: '1-Click full-resolution ZIP download', included: true },
      { label: 'Printable QR table cards & posters', included: true },
      { label: '30 Days high-speed cloud archive', included: true },
    ],
  },
  {
    id: 'medium',
    name: 'MEDIUM EVENT',
    price: { inr: '₹1,999', usd: '$29' },
    period: '/event',
    highlight: true,
    badge: '⭐ Most Popular for Weddings',
    iconColor: 'text-amber-400',
    description: '100 – 300 guests',
    tagline: 'Designed for standard weddings, receptions, and corporate galas.',
    stats: '100 – 300 Guests',
    features: [
      { label: 'Everything in Small tier', included: true },
      { label: 'Up to 300 contributing guests', included: true },
      { label: 'Multi-screen live wall display mode', included: true },
      { label: 'Curated acoustic & party background audio', included: true },
      { label: 'Priority real-time sync bandwidth', included: true },
      { label: 'WhatsApp fast-join bot integration', included: true },
      { label: '60 Days cloud archive storage', included: true },
    ],
  },
  {
    id: 'large',
    name: 'LARGE EVENT',
    price: { inr: '₹3,499', usd: '$49' },
    period: '/event',
    badge: 'Grand Celebrations',
    iconColor: 'text-purple-400',
    description: '300+ guests',
    tagline: 'Built for grand luxury weddings, multi-day celebrations, and conferences.',
    stats: '300+ Guests',
    features: [
      { label: 'Everything in Medium tier', included: true },
      { label: 'Supports 300 to 1,000+ guests', included: true },
      { label: 'Full white-label agency mode', included: true },
      { label: 'Tethered DSLR / Camera auto-import support', included: true },
      { label: 'Multi-hall & multi-stage sync', included: true },
      { label: 'VIP dedicated concierge support on WhatsApp', included: true },
      { label: '90 Days extended cloud archive', included: true },
    ],
  },
];

// ── New Guest-Tier Pricing Model ─────────────────────────────────
export interface GuestTier {
  id: 'SMALL' | 'MEDIUM' | 'LARGE';
  name: string;
  guestRange: string;
  guestLimit: number;
  price: { inr: number; usd: number };
  badge?: string;
  highlight?: boolean;
  tagline: string;
  features: string[];
}

export const GUEST_TIERS: GuestTier[] = [
  {
    id: 'SMALL',
    name: 'Small Event',
    guestRange: 'Up to 100 Guests',
    guestLimit: 100,
    price: { inr: 999, usd: 15 },
    tagline: 'Ideal for intimate weddings, dinners, and private birthday parties.',
    features: [
      'Unlimited photos & videos',
      'Interactive Live Photo Wall',
      'Host moderation console',
      'Custom couple & studio branding',
      '1-Click full-resolution ZIP download',
      'Printable QR table cards & posters',
      '30 Days high-speed cloud archive',
    ],
  },
  {
    id: 'MEDIUM',
    name: 'Medium Event',
    guestRange: '100 – 300 Guests',
    guestLimit: 300,
    price: { inr: 1999, usd: 29 },
    highlight: true,
    badge: '⭐ Most Popular for Weddings',
    tagline: 'Designed for standard weddings, receptions, and corporate galas.',
    features: [
      'Everything in Small tier',
      'Up to 300 contributing guests',
      'Multi-screen live wall display mode',
      'Curated acoustic & party background audio',
      'Priority real-time sync bandwidth',
      'WhatsApp fast-join bot integration',
      '60 Days cloud archive storage',
    ],
  },
  {
    id: 'LARGE',
    name: 'Large Event',
    guestRange: '300+ Guests',
    guestLimit: 1000,
    price: { inr: 3499, usd: 49 },
    badge: 'Grand Celebrations',
    tagline: 'Built for grand luxury weddings, multi-day celebrations, and conferences.',
    features: [
      'Everything in Medium tier',
      'Supports 300 to 1,000+ guests',
      'Full white-label agency mode',
      'Tethered DSLR / Camera auto-import support',
      'Multi-hall & multi-stage sync',
      'VIP dedicated concierge support on WhatsApp',
      '90 Days extended cloud archive',
    ],
  },
];

// Helper: get tier by ID
export function getTierById(id: string): GuestTier | undefined {
  return GUEST_TIERS.find((t) => t.id === id.toUpperCase());
}

// Helper: determine tier from guest count
export function getTierForGuestCount(count: number): GuestTier {
  if (count <= 100) return GUEST_TIERS[0];
  if (count <= 300) return GUEST_TIERS[1];
  return GUEST_TIERS[2];
}

// Multi-event discount
export const MULTI_EVENT_DISCOUNT_THRESHOLD = 5;
export const MULTI_EVENT_DISCOUNT_PERCENT = 15;
