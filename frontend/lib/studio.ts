import { GUEST_TIERS, GuestTier, MULTI_EVENT_DISCOUNT_PERCENT, MULTI_EVENT_DISCOUNT_THRESHOLD } from './plans';

export interface StudioProfile {
  id: string;
  owner_user_id: string;
  studio_name: string;
  logo_url: string | null;
  brand_colors: { primary: string; secondary: string };
  default_currency: 'INR' | 'USD';
  multi_event_discount_percent: number;
  created_at: string;
  updated_at: string;
}

export interface StudioEvent {
  id: string;
  studio_id: string | null;
  event_name: string | null;
  event_date: string | null;
  venue: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  guest_tier: 'SMALL' | 'MEDIUM' | 'LARGE';
  guest_limit: number;
  current_guest_count: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  is_white_labeled: boolean;
  slug: string;
  created_at: string;
}

// Calculate tier price with optional multi-event discount
export function calculateTierPrice(
  tier: GuestTier,
  currency: 'INR' | 'USD',
  eventCount: number = 1
): { unitPrice: number; totalPrice: number; discount: number; discountApplied: boolean } {
  const unitPrice = currency === 'INR' ? tier.price.inr : tier.price.usd;
  const discountApplied = eventCount >= MULTI_EVENT_DISCOUNT_THRESHOLD;
  const discount = discountApplied ? MULTI_EVENT_DISCOUNT_PERCENT : 0;
  const totalPrice = unitPrice * eventCount * (1 - discount / 100);
  return { unitPrice, totalPrice: Math.round(totalPrice), discount, discountApplied };
}

// Format price with currency symbol
export function formatPrice(amount: number, currency: 'INR' | 'USD'): string {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return `$${amount.toLocaleString('en-US')}`;
}

// Get guest usage percentage
export function getGuestUsagePercent(current: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((current / limit) * 100);
}

// Check if event is near or over guest limit
export function getGuestStatus(current: number, limit: number): 'ok' | 'warning' | 'exceeded' {
  const percent = getGuestUsagePercent(current, limit);
  if (percent >= 100) return 'exceeded';
  if (percent >= 80) return 'warning';
  return 'ok';
}

// Get upgrade price difference
export function getUpgradeCost(
  currentTier: GuestTier,
  targetTier: GuestTier,
  currency: 'INR' | 'USD'
): number {
  const currentPrice = currency === 'INR' ? currentTier.price.inr : currentTier.price.usd;
  const targetPrice = currency === 'INR' ? targetTier.price.inr : targetTier.price.usd;
  return Math.max(0, targetPrice - currentPrice);
}

// Event status badge config
export function getStatusConfig(status: string): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'ACTIVE': return { label: 'Live', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' };
    case 'CLOSED': return { label: 'Closed', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' };
    default: return { label: 'Draft', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' };
  }
}
