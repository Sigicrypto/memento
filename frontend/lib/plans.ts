
export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  highlight?: boolean;
  stats: string;
  description: string;
  tagline: string;
  iconColor: string;
  features: PlanFeature[];
  badge?: string;
}

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  stats: string;
  description: string;
  tagline: string;
  iconColor: string;
  features: PlanFeature[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'FREE',
    price: '₹0',
    iconColor: 'text-slate-400',
    description: 'Great for trying out Memento',
    tagline: 'Basic photo collection for small gatherings.',
    stats: 'Up to 30 photos',
    features: [
      { label: 'Collect guest photos instantly', included: true },
      { label: 'Basic photo gallery view', included: true },
      { label: 'Event QR code sharing', included: true },
      { label: 'Memento watermark branding', included: true },
      { label: '24 Hours cloud storage', included: true },
      { label: 'Live Wall presentation mode', included: false },
      { label: 'Host photo moderation', included: false },
      { label: 'Full-resolution ZIP download', included: false },
      { label: 'Custom branding removal', included: false },
    ],
  },
  {
    id: 'event',
    name: 'EVENT',
    price: '₹999',
    period: '/event',
    highlight: true,
    badge: '⭐ Most Popular',
    iconColor: 'text-cyan-400',
    description: 'Perfect for weddings, birthdays & celebrations',
    tagline: 'Complete live memory experience for your special day.',
    stats: 'Up to 1,000 photos + videos',
    features: [
      { label: 'Everything in Free +', included: true },
      { label: '1,000 photo & video uploads', included: true },
      { label: 'Interactive Live Photo Wall', included: true },
      { label: 'High-res ZIP album download', included: true },
      { label: 'Private password-protected gallery', included: true },
      { label: 'Printable QR card asset suite', included: true },
      { label: '7 Days secure cloud storage', included: true },
      { label: 'Custom branding & live wall theme', included: false },
      { label: 'AI Memory highlights', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '₹2,999',
    period: '/event',
    badge: '🔥 Best Value',
    iconColor: 'text-amber-400',
    description: 'For luxury weddings & multi-day events',
    tagline: 'Generous memories with total moderation and custom branding.',
    stats: 'Up to 5,000 photos + videos',
    features: [
      { label: 'Everything in Event +', included: true },
      { label: '5,000 photos & 4K video clips', included: true },
      { label: 'Premium Live Wall with background music', included: true },
      { label: 'Host moderation (approve/reject uploads)', included: true },
      { label: 'Custom wall branding & couple logo', included: true },
      { label: 'Extended 30 Days cloud storage', included: true },
      { label: 'Memento Pro Camera & manual controls', included: true },
      { label: 'AI Highlights preview & auto-albums', included: true },
      { label: 'White-label custom domain', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: '₹7,999',
    period: '/month',
    iconColor: 'text-purple-400',
    description: 'For photographers, planners & agencies',
    tagline: 'Multi-event white-label platform for event businesses.',
    stats: '10,000 photos per event',
    features: [
      { label: 'Everything in Premium +', included: true },
      { label: '10,000 photos per event (unlimited events)', included: true },
      { label: 'Full white-label branding removal', included: true },
      { label: 'Client dashboard management', included: true },
      { label: 'Custom domain connection', included: true },
      { label: 'Corporate sponsor branding', included: true },
      { label: 'Extended 90 Days cloud storage', included: true },
    ],
  },
];

