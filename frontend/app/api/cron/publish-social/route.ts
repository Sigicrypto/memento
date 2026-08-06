import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { publishToFacebookPage, publishToInstagramBusiness } from '@/lib/metaSocial';

// Ensure secret protection for cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'memento_social_cron_secret';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secretParam = searchParams.get('secret');

  // Verify secret authorization
  if (secretParam !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  const fbPageId = process.env.META_FACEBOOK_PAGE_ID;
  const igUserId = process.env.META_INSTAGRAM_USER_ID;
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken || (!fbPageId && !igUserId)) {
    return NextResponse.json({
      error: 'Missing Meta API credentials in environment variables (META_PAGE_ACCESS_TOKEN, META_FACEBOOK_PAGE_ID, META_INSTAGRAM_USER_ID)',
    }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();

    // Fetch next pending post scheduled on or before current time
    const { data: posts, error } = await supabase
      .from('social_posts_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(5);

    if (error) {
      throw new Error(`Database error fetching social posts: ${error.message}`);
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No pending posts scheduled for publishing right now.' });
    }

    const results = [];

    for (const post of posts) {
      try {
        let fbResult = null;
        let igResult = null;

        // Publish to Facebook
        if ((post.platform === 'facebook' || post.platform === 'both') && fbPageId) {
          fbResult = await publishToFacebookPage({
            pageId: fbPageId,
            accessToken: pageAccessToken,
            message: post.caption,
            imageUrl: post.image_url,
          });
        }

        // Publish to Instagram
        if ((post.platform === 'instagram' || post.platform === 'both') && igUserId) {
          igResult = await publishToInstagramBusiness({
            igUserId: igUserId,
            accessToken: pageAccessToken,
            caption: post.caption,
            imageUrl: post.image_url,
          });
        }

        // Mark as published
        await supabase
          .from('social_posts_queue')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          status: 'published',
          facebook: fbResult,
          instagram: igResult,
        });
      } catch (postErr: any) {
        // Record failure in DB
        await supabase
          .from('social_posts_queue')
          .update({
            status: 'failed',
            error_message: postErr.message || 'Unknown error during publishing',
          })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          status: 'failed',
          error: postErr.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
