import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * POST /api/cron/cleanup-expired-trials
 * 
 * This endpoint should be called by a CRON job (Supabase Edge Functions, n8n, or Vercel Cron)
 * every 24 hours to:
 * 1. Mark expired trials (expires_at < now) as 'expired'
 * 2. Move expired trials older than 48h to inactive_users
 * 3. Delete expired trial sites older than 48h
 * 
 * Security: Should be protected with a secret token in production
 */
export async function POST(request: NextRequest) {
  try {
    // Require CRON secret authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    let stats = {
      markedExpired: 0,
      movedToInactive: 0,
      deleted: 0,
      errors: [] as string[],
    };

    // Step 1: Mark expired trials (expires_at < now AND status != 'approved' AND status != 'expired')
    try {
      const { data: expiredSites, error: expiredError } = await supabaseAdmin
        .from('sites')
        .update({ status: 'expired', updated_at: now.toISOString() })
        .lt('expires_at', now.toISOString())
        .neq('status', 'approved')
        .neq('status', 'expired')
        .select('id, user_id, username, email:users(email), content, theme_slug');

      if (expiredError) {
        stats.errors.push(`Error marking expired: ${expiredError.message}`);
      } else {
        stats.markedExpired = expiredSites?.length || 0;
      }

      // Step 2: Move expired trials older than 48h to inactive_users
      if (expiredSites && expiredSites.length > 0) {
        const sitesToMove = expiredSites.filter((site: any) => {
          const expiresAt = new Date(site.expires_at);
          return expiresAt < fortyEightHoursAgo;
        });

        for (const site of sitesToMove) {
          try {
            // Get user email
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('email')
              .eq('id', site.user_id)
              .single();

            // Calculate retention until (6 months from expiry)
            const expiryDate = new Date(site.expires_at);
            const retentionUntil = new Date(expiryDate);
            retentionUntil.setMonth(retentionUntil.getMonth() + 6);

            // Move to inactive_users
            const { error: inactiveError } = await supabaseAdmin
              .from('inactive_users')
              .insert({
                username: site.username,
                email: user?.email || 'unknown@example.com',
                user_id: site.user_id,
                trial_expired_at: site.expires_at,
                data_json: {
                  content: site.content,
                  theme_slug: site.theme_slug,
                  created_at: site.created_at,
                },
                retention_until: retentionUntil.toISOString(),
              });

            if (!inactiveError) {
              stats.movedToInactive++;
            } else {
              stats.errors.push(`Error moving ${site.username} to inactive: ${inactiveError.message}`);
            }
          } catch (err: any) {
            stats.errors.push(`Error processing ${site.username}: ${err.message}`);
          }
        }

        // Step 3: Delete expired sites older than 48h
        const { data: deletedSites, error: deleteError } = await supabaseAdmin
          .from('sites')
          .delete()
          .lt('expires_at', fortyEightHoursAgo.toISOString())
          .eq('status', 'expired')
          .select('id');

        if (deleteError) {
          stats.errors.push(`Error deleting expired sites: ${deleteError.message}`);
        } else {
          stats.deleted = deletedSites?.length || 0;
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Cleanup completed',
          stats,
          timestamp: now.toISOString(),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Cleanup error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Cleanup failed',
          stats,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

