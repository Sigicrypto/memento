export type Region = 'IN' | 'GLOBAL';

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  priceIN: string;
  priceGlobal: string;
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
    id: 'starter',
    name: 'Starter',
    priceIN: '2,500',
    priceGlobal: '30',
    iconColor: 'text-green-400',
    description: 'Perfect for small, basic events',
    tagline: 'Simple, fast photo sharing for your event.',
    stats: 'Up to 150 guests',
    features: [
      { label: 'Collect guest photos instantly', included: true },
      { label: 'Live photo wall experience', included: true },
      { label: '5 photo uploads per guest', included: true },
      { label: 'Download all photos as ZIP', included: true },
      { label: '1 Month Secure Storage', included: true },
      { label: 'AI Face Discovery', included: false },
      { label: 'Slideshow Designer', included: false },
      { label: 'Real-time Reactions', included: false },
      { label: 'Cinematic Soundtrack', included: false },
      { label: 'Branding Removal', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    priceIN: '5,000',
    priceGlobal: '60',
    highlight: true,
    badge: '⭐ Highly Recommended',
    iconColor: 'text-primary',
    description: 'For interactive and lively events',
    tagline: 'Bring your event to life with interactive features.',
    stats: 'Up to 300 guests',
    features: [
      { label: 'Everything in Starter +', included: true },
      { label: '15 photo uploads per guest', included: true },
      { label: '🎥 Auto AI Album Creation', included: true },
      { label: '🎨 Custom wall branding', included: true },
      { label: '📊 Engagement Analytics', included: true },
      { label: '📺 4K Slideshow TV Mode', included: true },
      { label: '❤️ Real-time Reactions', included: true },
      { label: '3 Months Secure Storage', included: true },
      { label: 'Cinematic Soundtrack', included: false },
      { label: 'Branding Removal', included: false },
      { label: 'Custom Domain', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceIN: '7,500',
    priceGlobal: '90',
    badge: '🔥 Best Value',
    iconColor: 'text-secondary',
    description: 'For luxury weddings & VIP events',
    tagline: 'A premium, fully featured photo experience.',
    stats: 'Unlimited guests',
    features: [
      { label: 'Everything in Standard +', included: true },
      { label: 'Unlimited photo uploads', included: true },
      { label: '🎶 Cinematic Soundtrack', included: true },
      { label: '⏳ Auto-expiring galleries', included: true },
      { label: '🛡️ Priority 24/7 Support', included: true },
      { label: '🔒 Advanced Privacy Vault', included: true },
      { label: '☁️ Immediate Cloud Sync', included: true },
      { label: '6 Months Secure Storage', included: true },
      { label: 'Branding Removal', included: false },
      { label: 'Custom Domain', included: false },
      { label: 'Partner Resell', included: false },
    ],
  },
  {
    id: 'whitelabel',
    name: 'White Label',
    priceIN: '10,000',
    priceGlobal: '120',
    iconColor: 'text-indigo-400',
    description: 'For agencies & photographers',
    tagline: 'Launch your own branded platform.',
    stats: 'Multi-event dashboard',
    features: [
      { label: 'Everything in Premium +', included: true },
      { label: '🔥 Full branding removal', included: true },
      { label: '🌐 Custom domain connection', included: true },
      { label: '💰 Partner resell rights', included: true },
      { label: '📊 Unified Client Portal', included: true },
      { label: '🚀 Concierge Setup Service', included: true },
      { label: '6 Months Secure Storage', included: true },
      { label: 'Custom Domain', included: true },
      { label: 'Partner Resell', included: true },
    ],
  },
];
