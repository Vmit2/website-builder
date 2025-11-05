import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createAuditLog } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendApprovalEmail } from '@/lib/email';
import { getSiteUrl } from '@/lib/utils';

/**
 * Admin approval endpoint
 * POST /api/admin/approve
 * Body: { siteId: string, comment?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { siteId, comment } = body;
    const adminId = admin.id;

    if (!siteId || !adminId) {
      return NextResponse.json(
        { error: 'Site ID and Admin ID are required.' },
        { status: 400 }
      );
    }

    // Get site details with user info
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*, users(email, full_name)')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found.' },
        { status: 404 }
      );
    }

    // Update site status - clear expires_at when approved (permanent)
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        status: 'approved',
        coming_soon: false,
        expires_at: null, // Clear expiry for approved sites
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve site.' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog(
      adminId,
      'SITE_APPROVED',
      'sites',
      siteId,
      { comment }
    );

    // Send approval email to user
    if (site.users?.email) {
      const siteUrl = getSiteUrl(site.username);
      await sendApprovalEmail(
        site.users.email,
        site.users.full_name || site.username,
        siteUrl
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Site approved successfully.',
        site: {
          id: site.id,
          username: site.username,
          status: 'approved',
          coming_soon: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
