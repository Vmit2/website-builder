import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * GET /api/get-site-status?subdomain=username
 * 
 * Lightweight endpoint for middleware to check site status and determine redirects.
 * Returns minimal data needed for routing decisions.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required.' },
        { status: 400 }
      );
    }

    // Fetch minimal site data needed for routing
    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('id, username, status, expires_at')
      .eq('username', subdomain)
      .single();

    // Site not found
    if (error || !site) {
      return NextResponse.json(
        {
          found: false,
          redirect: '/subdomain-availability',
          redirectParams: { username: subdomain },
        },
        { status: 200 }
      );
    }

    const now = new Date();
    const status = site.status;
    const expiresAt = site.expires_at ? new Date(site.expires_at) : null;

    // Handle different status states
    if (status === 'approved') {
      // Approved sites - always render
      return NextResponse.json({
        found: true,
        status: 'approved',
        render: true,
      });
    }

    if (status === 'deleted') {
      // Site was deleted by cleanup job
      return NextResponse.json({
        found: true,
        status: 'deleted',
        redirect: '/deleted-site',
        redirectParams: { subdomain },
      });
    }

    if (status === 'expired') {
      // Site marked as expired by check-trials function
      return NextResponse.json({
        found: true,
        status: 'expired',
        redirect: '/upgrade',
        redirectParams: { from: subdomain },
      });
    }

    // For 'pending' or 'trial' status, check expiry
    if (status === 'pending' || status === 'trial') {
      if (!expiresAt) {
        // No expiry date - treat as active
        return NextResponse.json({
          found: true,
          status,
          render: true,
        });
      }

      if (now > expiresAt) {
        // Trial expired but status not yet updated by check-trials
        return NextResponse.json({
          found: true,
          status: 'expired_but_not_marked',
          redirect: '/trial-expired',
          redirectParams: { subdomain },
        });
      }

      // Active trial
      return NextResponse.json({
        found: true,
        status,
        render: true,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // Default: render site
    return NextResponse.json({
      found: true,
      status,
      render: true,
    });
  } catch (error) {
    console.error('Get site status error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
