import { NextResponse } from 'next/server';
import https from 'https';

// Custom fetch helper that handles local SSL certificate inspection issues (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
async function secureMetaFetch(url: string) {
  const agent = new https.Agent({ rejectUnauthorized: false });

  return new Promise<any>((resolve, reject) => {
    https
      .get(url, { agent }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Meta response: ' + data));
          }
        });
      })
      .on('error', (err) => reject(err));
  });
}

export async function POST(request: Request) {
  try {
    const { code, appId, appSecret, redirectUri, directToken } = await request.json();

    // Direct Token Inspection Mode
    if (directToken) {
      const inspectUrl = `https://graph.facebook.com/v20.0/me?fields=id,name,instagram_business_account,connected_instagram_account&access_token=${encodeURIComponent(
        directToken.trim()
      )}`;
      const data = await secureMetaFetch(inspectUrl);

      if (data.error) {
        // Try fetching accounts list if /me is a user token
        const accountsUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,instagram_business_account,connected_instagram_account&access_token=${encodeURIComponent(
          directToken.trim()
        )}`;
        const accountsData = await secureMetaFetch(accountsUrl);

        if (accountsData.error) {
          return NextResponse.json({ error: data.error.message || 'Token verification failed' }, { status: 400 });
        }

        const pages = (accountsData.data || []).map((page: any) => ({
          pageId: page.id,
          pageName: page.name,
          pageToken: page.access_token || directToken.trim(),
          instagramId: page.instagram_business_account?.id || page.connected_instagram_account?.id || null,
        }));

        return NextResponse.json({ success: true, pages });
      }

      const pages = [
        {
          pageId: data.id,
          pageName: data.name,
          pageToken: directToken.trim(),
          instagramId: data.instagram_business_account?.id || data.connected_instagram_account?.id || null,
        },
      ];

      return NextResponse.json({ success: true, pages });
    }

    if (!code || !appId || !redirectUri) {
      return NextResponse.json({ error: 'Missing code, App ID, or redirect URI.' }, { status: 400 });
    }

    if (!appSecret) {
      return NextResponse.json(
        { error: 'Facebook App Secret is required to exchange tokens. Please enter your App Secret on the screen.' },
        { status: 400 }
      );
    }

    // 1. Exchange code for short-lived user access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${encodeURIComponent(
      appId.trim()
    )}&redirect_uri=${encodeURIComponent(redirectUri.trim())}&client_secret=${encodeURIComponent(
      appSecret.trim()
    )}&code=${encodeURIComponent(code.trim())}`;

    const tokenData = await secureMetaFetch(tokenUrl);

    if (tokenData.error) {
      console.error('Meta OAuth Token Exchange Error:', tokenData.error);
      return NextResponse.json(
        { error: tokenData.error.message || tokenData.error.error_user_msg || 'Meta token exchange failed' },
        { status: 400 }
      );
    }

    const shortUserToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived user access token
    const longTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
      appId.trim()
    )}&client_secret=${encodeURIComponent(appSecret.trim())}&fb_exchange_token=${encodeURIComponent(shortUserToken)}`;

    const longTokenData = await secureMetaFetch(longTokenUrl);
    const longUserToken = longTokenData.access_token || shortUserToken;

    // 3. Fetch Facebook Pages and linked Instagram accounts
    const accountsUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,instagram_business_account,connected_instagram_account&access_token=${encodeURIComponent(
      longUserToken
    )}`;

    const accountsData = await secureMetaFetch(accountsUrl);

    if (accountsData.error) {
      console.error('Meta Accounts Fetch Error:', accountsData.error);
      return NextResponse.json({ error: accountsData.error.message || 'Failed to fetch Facebook Pages' }, { status: 400 });
    }

    const pages = (accountsData.data || []).map((page: any) => ({
      pageId: page.id,
      pageName: page.name,
      pageToken: page.access_token,
      instagramId: page.instagram_business_account?.id || page.connected_instagram_account?.id || null,
    }));

    return NextResponse.json({
      success: true,
      longUserToken,
      pages,
    });
  } catch (error: any) {
    console.error('Meta API Route Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
