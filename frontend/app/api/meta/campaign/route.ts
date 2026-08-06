import { NextResponse } from 'next/server';
import https from 'https';

const CAMPAIGN_PRESETS: Record<string, { topic: string; caption: string; imageUrl: string }> = {
  wedding: {
    topic: 'Weddings',
    caption: `💍 Stop waiting 4 weeks for wedding photos! With Memento, guests scan a QR code at their table, snap photos on their phones, and watch them appear live on the big screen! 

✨ Custom branding
✨ Zero app downloads required
✨ Instant guest photo sharing

Book your live QR wall today at www.mymementoapp.com 🥂❤️

#WeddingInspiration #LivePhotoWall #WeddingTech #Memento #EventPlanner #WeddingPlanning #InteractiveWeddings`,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  },
  corporate: {
    topic: 'Corporate Galas & Brand Activations',
    caption: `🚀 Transform corporate event engagement in 1 scan! Memento turns every attendee's smartphone into a live camera feed for your main stage screen.

📈 3x higher guest participation
🎨 Custom corporate branding & logo overlay
🛡️ Real-time photo moderation

Elevate your brand experience at www.mymementoapp.com 🌟

#CorporateEvents #EventMarketing #BrandActivation #EventPlanner #Memento #EventTech #LiveEngagement`,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  },
  birthday: {
    topic: 'Birthdays & Private Parties',
    caption: `🎉 Make your party unforgettable! Capture every angle of your celebration with Memento's live QR photo wall.

📱 Guests just scan & upload
✨ Live wall slideshow with animations
💖 Download the full photo album after the party!

Setup your wall in 2 minutes at www.mymementoapp.com 🥳

#PartyIdeas #BirthdayCelebration #PhotoWall #MementoApp #LivePartyFeed #EventTech`,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  },
  product: {
    topic: 'Product Spotlight',
    caption: `⚡ Why event hosts love Memento: No app downloads, no complicated setup, and instant live photo sharing for any venue screen or TV.

Create your memory wall for your next event at www.mymementoapp.com!

#EventTech #DigitalPhotoWall #Memento #LiveEvents #EventOrganizers`,
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
  },
};

async function securePost(url: string, body: any) {
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

export async function POST(request: Request) {
  try {
    const { presetKey, customCaption, customImageUrl, target = 'both' } = await request.json();

    const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
    const instagramId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!pageToken) {
      return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN is missing in .env.local' }, { status: 400 });
    }

    const preset = CAMPAIGN_PRESETS[presetKey] || CAMPAIGN_PRESETS.wedding;
    const finalCaption = customCaption || preset.caption;
    const finalImageUrl = customImageUrl || preset.imageUrl;

    const results: any = {};

    // 1. Post to Facebook Page
    if (target === 'facebook' || target === 'both') {
      const fbUrl = `https://graph.facebook.com/v20.0/me/photos`;
      results.facebook = await securePost(fbUrl, {
        url: finalImageUrl,
        caption: finalCaption,
        access_token: pageToken,
      });
    }

    // 2. Post to Instagram Business Account
    if ((target === 'instagram' || target === 'both') && instagramId) {
      const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
      const containerRes = await securePost(containerUrl, {
        image_url: finalImageUrl,
        caption: finalCaption,
        access_token: pageToken,
      });

      if (containerRes.id) {
        const publishUrl = `https://graph.facebook.com/v20.0/${instagramId}/media_publish`;
        results.instagram = await securePost(publishUrl, {
          creation_id: containerRes.id,
          access_token: pageToken,
        });
      } else {
        results.instagram = containerRes;
      }
    }

    return NextResponse.json({
      success: true,
      caption: finalCaption,
      imageUrl: finalImageUrl,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Campaign creation failed' }, { status: 500 });
  }
}
