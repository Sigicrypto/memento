export type PlanTier = 'STARTER' | 'STANDARD' | 'PREMIUM' | 'WHITELABEL';

export type Feature = 
  | 'ZIP_DOWNLOAD' 
  | 'CUSTOM_THEME' 
  | 'LIVE_REACTIONS' 
  | 'SLIDESHOW_MUSIC' 
  | 'BRANDING_REMOVAL' 
  | 'CUSTOM_DOMAIN'
  | 'SELFIE_MATCH'
  | 'GUEST_DOWNLOAD'
  | 'VIDEO_UPLOAD'
  | 'SLIDESHOW_MODE';

const TIER_RANK: Record<PlanTier, number> = {
  STARTER: 0,
  STANDARD: 1,
  PREMIUM: 2,
  WHITELABEL: 3,
};

export const GUEST_UPLOAD_LIMITS: Record<PlanTier, number> = {
  STARTER: 5,
  STANDARD: 15,
  PREMIUM: Infinity,
  WHITELABEL: Infinity,
};

export function getGuestPhotoLimit(currentPlan: string | null | undefined): number {
  if (!currentPlan) return GUEST_UPLOAD_LIMITS.STARTER;
  const normalizedPlan = currentPlan.toUpperCase() as PlanTier;
  return GUEST_UPLOAD_LIMITS[normalizedPlan] ?? GUEST_UPLOAD_LIMITS.STARTER;
}

const FEATURE_MIN_TIER: Record<Feature, PlanTier> = {
  ZIP_DOWNLOAD: 'STARTER', // Updated based on marketing
  CUSTOM_THEME: 'STANDARD',
  LIVE_REACTIONS: 'STANDARD',
  SELFIE_MATCH: 'STANDARD',
  GUEST_DOWNLOAD: 'STANDARD',
  SLIDESHOW_MODE: 'STANDARD',
  SLIDESHOW_MUSIC: 'PREMIUM',
  VIDEO_UPLOAD: 'PREMIUM',
  BRANDING_REMOVAL: 'WHITELABEL',
  CUSTOM_DOMAIN: 'WHITELABEL',
};

/**
 * Super admin email — has access to everything.
 */
const SUPER_ADMIN_EMAIL = 'sagarfalcon@gmail.com';

/**
 * Check if a plan tier has access to a specific feature.
 * Tiers are hierarchical: higher tiers include all lower tier features.
 * Super admin always returns true.
 */
export function hasFeature(currentPlan: string | null | undefined, feature: Feature, userEmail?: string | null): boolean {
  // Super admin bypass
  if (userEmail === SUPER_ADMIN_EMAIL) return true;
  
  if (!currentPlan) return false;
  
  const normalizedPlan = currentPlan.toUpperCase() as PlanTier;
  const currentRank = TIER_RANK[normalizedPlan] ?? 0;
  
  const requiredTier = FEATURE_MIN_TIER[feature];
  const requiredRank = TIER_RANK[requiredTier];
  
  return currentRank >= requiredRank;
}

/**
 * Get the name of the tier required for a feature (for "Upgrade" prompts).
 */
export function getRequiredTier(feature: Feature): string {
  const tier = FEATURE_MIN_TIER[feature];
  return tier.charAt(0) + tier.slice(1).toLowerCase().replace('_', ' ');
}
