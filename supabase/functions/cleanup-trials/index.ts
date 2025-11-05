// Supabase Edge Function: cleanup-trials
// Cleans up expired trial sites older than 48 hours
// - Moves to inactive_users table for 6-month retention
// - Deletes site records
// - Cleans up storage/deployments (if applicable)
// Run via Supabase Scheduler (cron: 0 */6 * * *) every 6 hours
//
// Note: This code runs in Deno runtime (not Node.js)
// TypeScript errors about Deno imports can be ignored - they work in Supabase Edge Functions

// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
// @ts-ignore - Deno runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  try {
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    let stats = {
      processed: 0,
      movedToInactive: 0,
      deleted: 0,
      storageCleaned: 0,
      errors: [] as string[],
    };

    // 1️⃣ Find expired trial sites older than 48 hours
    const { data: expiredSites, error: queryError } = await supabase
      .from('sites')
      .select(`
        id,
        username,
        expires_at,
        user_id,
        status,
        content,
        theme_slug,
        created_at,
        users!inner (
          email,
          full_name
        )
      `)
      .eq('status', 'expired')
      .lte('expires_at', fortyEightHoursAgo.toISOString())
      .not('expires_at', 'is', null);

    if (queryError) {
      console.error('Error fetching expired sites:', queryError);
      return new Response(
        JSON.stringify({
          error: 'Database query error',
          message: queryError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!expiredSites || expiredSites.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired trials to clean up',
          stats: { processed: 0, movedToInactive: 0, deleted: 0, storageCleaned: 0 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2️⃣ Process each expired site
    for (const site of expiredSites) {
      try {
        const user = site.users as any;
        const userEmail = user?.email || 'unknown@example.com';
        const siteUrl = `${site.username}.at-solvexx.com`;

        // Calculate retention until (6 months from expiry)
        const expiryDate = new Date(site.expires_at);
        const retentionUntil = new Date(expiryDate);
        retentionUntil.setMonth(retentionUntil.getMonth() + 6);

        // 3️⃣ Move to inactive_users table (for 6-month retargeting)
        const { error: inactiveError } = await supabase
          .from('inactive_users')
          .insert({
            username: site.username,
            email: userEmail,
            user_id: site.user_id,
            trial_expired_at: site.expires_at,
            data_json: {
              content: site.content || {},
              theme_slug: site.theme_slug,
              created_at: site.created_at,
              site_id: site.id,
            },
            retention_until: retentionUntil.toISOString(),
          });

        if (inactiveError) {
          // Check if already exists (duplicate prevention)
          if (!inactiveError.message.includes('duplicate') && !inactiveError.message.includes('unique')) {
            stats.errors.push(`Error moving ${site.username} to inactive: ${inactiveError.message}`);
            continue;
          }
          // If duplicate, continue (already moved)
        } else {
          stats.movedToInactive++;
        }

        // 4️⃣ Clean up storage (if static sites are stored)
        // Note: If sites are rendered dynamically from DB, this step can be skipped
        try {
          const storageBucket = 'trial-sites'; // Adjust bucket name if different
          
          // Try to remove site files from storage
          const filesToDelete = [
            `${site.username}/index.html`,
            `${site.username}/build`,
            `${site.username}`, // Delete entire folder
          ];

          for (const filePath of filesToDelete) {
            const { error: storageError } = await supabase.storage
              .from(storageBucket)
              .remove([filePath]);

            // Ignore "not found" errors (file might not exist)
            if (storageError && !storageError.message.includes('not found')) {
              console.warn(`Storage cleanup warning for ${filePath}:`, storageError.message);
            } else if (!storageError) {
              stats.storageCleaned++;
            }
          }
        } catch (storageErr) {
          // Storage cleanup is optional - log but don't fail
          console.warn(`Storage cleanup skipped for ${site.username}:`, storageErr);
        }

        // 5️⃣ Optional: Remove subdomain mapping via Cloudflare API
        // This would require Cloudflare API credentials
        // For now, we'll skip this as subdomains are managed via DNS wildcards
        // Future enhancement: Add Cloudflare API call here
        // await removeSubdomainMapping(site.username);

        // 6️⃣ Delete the site record
        const { error: deleteError } = await supabase
          .from('sites')
          .delete()
          .eq('id', site.id);

        if (deleteError) {
          stats.errors.push(`Error deleting site ${site.username}: ${deleteError.message}`);
        } else {
          stats.deleted++;
          console.log(`✅ Cleaned up expired trial: ${siteUrl}`);
        }

        // 7️⃣ Optional: Log to audit table
        try {
          await supabase
            .from('audit_logs')
            .insert({
              user_id: site.user_id,
              action: 'trial_cleanup',
              resource_type: 'site',
              resource_id: site.id,
              changes: {
                username: site.username,
                cleaned_at: now.toISOString(),
                moved_to_inactive: true,
              },
            });
        } catch (auditErr) {
          // Audit logging is optional - log but don't fail
          console.warn(`Audit log failed for ${site.username}:`, auditErr);
        }

        stats.processed++;
      } catch (error) {
        console.error(`Error processing site ${site.username}:`, error);
        stats.errors.push(`Error processing ${site.username}: ${error.message || error}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${stats.processed} expired trials. Moved ${stats.movedToInactive} to inactive, deleted ${stats.deleted} sites, cleaned ${stats.storageCleaned} storage items.`,
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
