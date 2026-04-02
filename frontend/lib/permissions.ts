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
  | 'VIDEO_UPLOAD';

const TIER_RANK: Record<PlanTier, number> = {
  STARTER: 0,
  STANDARD: 1,
  PREMIUM: 2,
  WHITELABEL: 3,
};

const FEATURE_MIN_TIER: Record<Feature, PlanTier> = {
  ZIP_DOWNLOAD: 'STARTER', // Updated based on marketing
  CUSTOM_THEME: 'STANDARD',
  LIVE_REACTIONS: 'STANDARD',
  SELFIE_MATCH: 'STANDARD',
  GUEST_DOWNLOAD: 'STANDARD',
  SLIDESHOW_MUSIC: 'PREMIUM',
  VIDEO_UPLOAD: 'PREMIUM',
  BRANDING_REMOVAL: 'WHITELABEL',
  CUSTOM_DOMAIN: 'WHITELABEL',
};

/**
 * Check if a plan tier has access to a specific feature.
 * Tiers are hierarchical: higher tiers include all lower tier features.
 */
export function hasFeature(currentPlan: string | null | undefined, feature: Feature): boolean {
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
