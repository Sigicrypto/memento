/**
 * Meta Social Media & Graph API Integration for Memento
 * Provides social sharing link generators and Meta Graph API auto-publishing helpers.
 */

export interface SocialShareParams {
  title: string;
  url: string;
  hashtags?: string[];
  imageUrl?: string;
}

/**
 * Generate shareable URLs for direct guest social sharing
 */
export function getSocialShareLinks(params: SocialShareParams) {
  const encodedUrl = encodeURIComponent(params.url);
  const encodedText = encodeURIComponent(`${params.title} - Shared via Memento QR Live Photo Wall! 📸✨`);
  const hashtagString = params.hashtags ? encodeURIComponent(params.hashtags.join(',')) : 'MementoLiveWall,EventTech';

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}&hashtags=${hashtagString}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

/**
 * Publish photo or event highlight to Facebook Business Page via Graph API
 */
export async function publishToFacebookPage(params: {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl?: string;
}) {
  const endpoint = params.imageUrl
    ? `https://graph.facebook.com/v19.0/${params.pageId}/photos`
    : `https://graph.facebook.com/v19.0/${params.pageId}/feed`;

  const payload = params.imageUrl
    ? { url: params.imageUrl, caption: params.message, access_token: params.accessToken }
    : { message: params.message, access_token: params.accessToken };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Facebook API Error: ${err.error?.message || 'Publishing failed'}`);
  }

  return await res.json();
}

/**
 * Publish Container & Media to Instagram Business Account via Graph API
 */
export async function publishToInstagramBusiness(params: {
  igUserId: string;
  accessToken: string;
  caption: string;
  imageUrl: string;
}) {
  // Step 1: Create Container
  const containerRes = await fetch(`https://graph.facebook.com/v19.0/${params.igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: params.imageUrl,
      caption: params.caption,
      access_token: params.accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || !containerData.id) {
    throw new Error(`Instagram Media Container Creation Failed: ${containerData.error?.message}`);
  }

  // Step 2: Publish Container
  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${params.igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: params.accessToken,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`Instagram Publish Failed: ${err.error?.message}`);
  }

  return await publishRes.json();
}
