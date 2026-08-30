import https from 'https';

export interface CampaignVariation {
  category: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  caption: string;
  imageUrl: string;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  wedding: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
  ],
  corporate: [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
  ],
  birthday: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
  ],
  product: [
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  ],
  hiring: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  ],
};

const HOOKS: Record<string, string[]> = {
  wedding: [
    '💍 Stop waiting 4 weeks to see your wedding photos!',
    '✨ The #1 wedding trend that couples are obsessed with in 2026:',
    '🥂 How to turn every wedding guest into a live photographer in 10 seconds:',
    '💖 Don’t let your guests’ photos stay hidden in their phone galleries!',
  ],
  corporate: [
    '🚀 Transform your corporate gala engagement in just 1 scan!',
    '📈 Want 3x higher guest participation at your next brand activation?',
    '💼 The secret to interactive corporate events that attendees actually remember:',
    '🌐 How top event directors display real-time attendee moments on main stage screens:',
  ],
  birthday: [
    '🎉 Make your party unforgettable without hiring expensive photo booths!',
    '🥳 Every guest gets to be part of your live party slideshow!',
    '✨ Capture every candid angle of your celebration live on screen:',
    '🎂 The ultimate interactive memory wall for your next party:',
  ],
  product: [
    '⚡ Zero App Downloads. 100% Instant Live Engagement.',
    '📱 Why event hosts choose Memento over traditional photo booths:',
    '💡 Turn any TV or projector into a live interactive memory wall in 2 minutes:',
  ],
  hiring: [
    '💼 HIRING: PAN-INDIA EVENT SALES PARTNER (100% COMMISSION BASIS - NO FIXED SALARY)',
    '🚀 WORK FROM ANYWHERE IN INDIA: Earn 10% Flat Commission per Deal + Instant Payout on Monetization!',
    '⚡ EARN 10% ON EVERY EVENT BOOKING: Live QR Photo Wall Sales Partners Needed Nationwide!',
    '🔥 PAN-INDIA FREELANCE OPPORTUNITY: 10% Commission per Deal (Paid Immediately on Monetization!)',
  ],
};

const BODIES: Record<string, string[]> = {
  wedding: [
    'With Memento, guests simply scan a table QR code on their phones, snap photos, and watch them pop up live on the venue wall screen!\n\n✨ Custom wedding branding\n✨ Real-time moderation\n✨ Download the complete photo album afterwards!',
    'Give your wedding guests an interactive experience they’ll rave about. Guests scan a QR code at their table and stream their photos directly to the main display screen!',
  ],
  corporate: [
    'Memento turns every attendee’s smartphone into a live content stream for your event screens.\n\n✅ Custom corporate logo overlay\n✅ Real-time moderation panel\n✅ Instant audience engagement',
    'Elevate your gala or product launch. Attendees scan a QR code to share event highlights live on your main venue screen!',
  ],
  birthday: [
    'Guests scan a QR code, upload their favorite party photos, and see them featured live on the party display with dynamic animations!\n\n🥳 100% free for guests\n🎉 Full album download after the party',
    'No app downloads required! Just scan, snap, and display live party memories on any screen or TV.',
  ],
  product: [
    'Memento is the effortless live photo wall for events. Guests scan a QR code, upload photos from their phone browser, and watch them project live instantly.',
  ],
  hiring: [
    'Introduce Memento\'s Live QR Photo Wall to wedding planners, corporate event hosts & venues across India!\n\n💰 10% Flat Commission per Closed Booking (No Fixed Salary)\n⚡ INSTANT PAYOUT as soon as lead is monetized (No waiting period!)\n🕒 Flexible Part-Time / Work-From-Anywhere Hours\n\n🎁 Benefits: Unlimited earning potential + 10% Flat Commission per Deal + INSTANT Payout on Monetization (UPI/Bank Transfer)!',
  ],
};

const CTAS = [
  '👉 Create your live QR wall today at www.mymementoapp.com 🥂',
  '🔗 Book your event memory wall in 2 minutes at www.mymementoapp.com 🚀',
  '✨ Start your free setup today at www.mymementoapp.com 🎉',
];

const HASHTAG_SETS = [
  ['#MementoApp', '#LivePhotoWall', '#EventTech', '#InteractiveEvents', '#EventPlanning'],
  ['#WeddingTech', '#CorporateEvents', '#EventMarketing', '#PartyIdeas', '#LiveEngagement'],
  ['#DigitalPhotoWall', '#EventPlanner', '#WeddingInspiration', '#BrandActivation', '#Memento'],
];

export function generateRandomCampaign(categoryInput: string = 'wedding'): CampaignVariation {
  const category = (categoryInput in HOOKS) ? categoryInput : 'wedding';

  const hooks = HOOKS[category];
  const bodies = BODIES[category];
  const images = CATEGORY_IMAGES[category];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const cta = CTAS[Math.floor(Math.random() * CTAS.length)];
  const hashtags = HASHTAG_SETS[Math.floor(Math.random() * HASHTAG_SETS.length)];
  const imageUrl = images[Math.floor(Math.random() * images.length)];

  const caption = `${hook}\n\n${body}\n\n${cta}\n\n${hashtags.join(' ')}`;

  return {
    category,
    hook,
    body,
    cta,
    hashtags,
    caption,
    imageUrl,
  };
}

export async function securePost(url: string, body: any) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (fetchErr) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const postData = JSON.stringify(body);

    return new Promise<any>((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
          agent,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Response parse error: ' + data));
            }
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.write(postData);
      req.end();
    });
  }
}

export async function publishToMeta({
  caption,
  imageUrl,
  target = 'both',
}: {
  caption: string;
  imageUrl: string;
  target?: 'both' | 'facebook' | 'instagram';
}) {
  let pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  let instagramId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (pageToken) {
    pageToken = pageToken.replace(/^META_PAGE_ACCESS_TOKEN=/, '').replace(/^["']|["']$/g, '').trim();
  }
  if (instagramId) {
    instagramId = instagramId.replace(/^INSTAGRAM_BUSINESS_ACCOUNT_ID=/, '').replace(/^["']|["']$/g, '').trim();
  }

  if (!pageToken) {
    return {
      error: 'META_PAGE_ACCESS_TOKEN is missing in Vercel environment variables',
      hasToken: false,
    };
  }

  const results: any = {
    hasToken: true,
    hasInstagramId: !!instagramId,
  };

  // 1. Post to Facebook Page
  if (target === 'facebook' || target === 'both') {
    const fbFeedUrl = `https://graph.facebook.com/v20.0/me/feed`;
    const fbRes = await securePost(fbFeedUrl, {
      message: caption,
      link: imageUrl,
      access_token: pageToken,
    });

    if (fbRes.error) {
      const fbPhotoUrl = `https://graph.facebook.com/v20.0/me/photos`;
      results.facebook = await securePost(fbPhotoUrl, {
        url: imageUrl,
        caption: caption,
        access_token: pageToken,
      });
    } else {
      results.facebook = fbRes;
    }
  }

  // 2. Post to Instagram Business Account
  if ((target === 'instagram' || target === 'both') && instagramId) {
    const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
    const containerRes = await securePost(containerUrl, {
      image_url: imageUrl,
      caption: caption,
      access_token: pageToken,
    });

    results.instagramContainer = containerRes;

    if (containerRes && containerRes.id) {
      // Allow Meta servers time to download and process high-res media before publishing
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const publishUrl = `https://graph.facebook.com/v20.0/${instagramId}/media_publish`;
      results.instagram = await securePost(publishUrl, {
        creation_id: containerRes.id,
        access_token: pageToken,
      });
    } else {
      results.instagram = containerRes;
    }
  }

  return results;
}
