import { NextResponse } from 'next/server';
import https from 'https';

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
    const { caption, imageUrl, target = 'both' } = await request.json();

    const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
    const instagramId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!pageToken) {
      return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN is missing in .env.local' }, { status: 400 });
    }

    const results: any = {};

    // 1. Post to Facebook Page
    if (target === 'facebook' || target === 'both') {
      const fbUrl = imageUrl
        ? `https://graph.facebook.com/v20.0/me/photos`
        : `https://graph.facebook.com/v20.0/me/feed`;

      const fbBody = imageUrl
        ? { url: imageUrl, caption, access_token: pageToken }
        : { message: caption, access_token: pageToken };

      results.facebook = await securePost(fbUrl, fbBody);
    }

    // 2. Post to Instagram Business Account
    if ((target === 'instagram' || target === 'both') && instagramId && imageUrl) {
      // Step A: Create Media Container
      const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
      const containerRes = await securePost(containerUrl, {
        image_url: imageUrl,
        caption: caption,
        access_token: pageToken,
      });

      if (containerRes.id) {
        // Step B: Publish Container
        const publishUrl = `https://graph.facebook.com/v20.0/${instagramId}/media_publish`;
        results.instagram = await securePost(publishUrl, {
          creation_id: containerRes.id,
          access_token: pageToken,
        });
      } else {
        results.instagram = containerRes;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
