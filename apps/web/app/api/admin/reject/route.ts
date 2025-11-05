import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createAuditLog } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendRejectionEmail } from '@/lib/email';

/**
 * POST /api/admin/reject
 * Admin rejects a site submission
 */

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { siteId, reason } = body;
    const adminId = admin.id;

    if (!siteId || !adminId) {
      return NextResponse.json(
        { error: 'Site ID and Admin ID are required.' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required.' },
        { status: 400 }
      );
    }

    // Get site details
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

    // Update site status to 'rejected'
    const { error: updateError } = await supabaseAdmin
      .from('sites')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject site.' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog(
      adminId,
      'SITE_REJECTED',
      'sites',
      siteId,
      { reason }
    );

    // Send rejection email to user
    if (site.users?.email) {
      await sendRejectionEmail(
        site.users.email,
        site.users.full_name || site.username,
        reason
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Site rejected successfully.',
        site: {
          id: site.id,
          username: site.username,
          status: 'rejected',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
